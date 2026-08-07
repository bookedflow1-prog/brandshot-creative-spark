import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { TOOLS, type ToolId } from "@/lib/ai-tools";

const RunInput = z.object({
  tool: z.string(),
  inputPath: z.string().optional(),
  prompt: z.string().max(600).optional(),
  style: z.string().optional(),
  ratio: z.string().optional(),
  projectId: z.string().uuid().optional(),
});

/**
 * Runs an AI image tool: charges credits atomically, calls the provider, stores
 * the result in the user's private bucket, and records it in the asset library.
 * Credits are refunded when the provider fails.
 */
export const runImageTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => RunInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tool = TOOLS[data.tool as ToolId];
    if (!tool) throw new Error("Unknown tool");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateImage, dataUrlToBytes, AiGatewayError } = await import("@/lib/ai-gateway.server");

    // Price from server-side settings, falling back to the catalog default.
    const { data: settings } = await supabase.from("app_settings").select("value").eq("key", "ai_prices").maybeSingle();
    const prices = (settings?.value ?? {}) as Record<string, number>;
    const cost = Number.isFinite(prices[tool.id]) ? Number(prices[tool.id]) : tool.credits;

    // Input image (must belong to the caller — RLS enforces this on the read).
    let inputDataUrl: string | undefined;
    if (data.inputPath) {
      if (!data.inputPath.startsWith(`${userId}/`)) throw new Error("Not your file");
      const { data: file, error: dlErr } = await supabaseAdmin.storage.from("user-media").download(data.inputPath);
      if (dlErr || !file) throw new Error("Could not read the source image");
      const buf = new Uint8Array(await file.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192));
      inputDataUrl = `data:${file.type || "image/png"};base64,${btoa(bin)}`;
    }

    const { data: job, error: jobErr } = await supabaseAdmin
      .from("ai_jobs")
      .insert({
        user_id: userId,
        tool: tool.id,
        status: "running",
        prompt: data.prompt ?? null,
        input_path: data.inputPath ?? null,
        metadata: { style: data.style ?? null, ratio: data.ratio ?? null },
      })
      .select("id")
      .single();
    if (jobErr) throw jobErr;

    // Charge first — the DB function rejects insufficient balances atomically.
    const { error: spendErr } = await supabaseAdmin.rpc("spend_credits", {
      _user_id: userId,
      _cost: cost,
      _reason: "ai_operation",
      _description: tool.label,
      _metadata: { tool: tool.id, job_id: job.id },
    });
    if (spendErr) {
      await supabaseAdmin.from("ai_jobs").update({ status: "failed", error: spendErr.message }).eq("id", job.id);
      if (spendErr.message.includes("insufficient_credits")) throw new Error("insufficient_credits");
      throw spendErr;
    }

    try {
      const promptText = tool.build({ prompt: data.prompt, style: data.style, ratio: data.ratio });
      const { dataUrl, model } = await generateImage({
        prompt: promptText,
        inputImages: inputDataUrl ? [inputDataUrl] : [],
      });
      const { bytes, mime } = dataUrlToBytes(dataUrl);
      const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
      const path = `${userId}/library/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("user-media")
        .upload(path, bytes, { contentType: mime, upsert: false });
      if (upErr) throw upErr;

      const { data: asset, error: assetErr } = await supabaseAdmin
        .from("project_assets")
        .insert({
          user_id: userId,
          project_id: data.projectId ?? null,
          kind: "generated",
          storage_path: path,
          mime_type: mime,
          name: `${tool.label} result`,
          source: "ai",
          size_bytes: bytes.length,
          metadata: { tool: tool.id, model, prompt: promptText, style: data.style ?? null, ratio: data.ratio ?? null },
        })
        .select("*")
        .single();
      if (assetErr) throw assetErr;

      await supabaseAdmin
        .from("ai_jobs")
        .update({ status: "succeeded", output_asset_id: asset.id, credits_spent: cost })
        .eq("id", job.id);

      return { asset, creditsSpent: cost };
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI generation failed";
      await supabaseAdmin.rpc("refund_credits", {
        _user_id: userId,
        _amount: cost,
        _description: `Refund: ${tool.label}`,
        _metadata: { job_id: job.id },
      });
      await supabaseAdmin.from("ai_jobs").update({ status: "failed", error: message }).eq("id", job.id);
      const status = err instanceof AiGatewayError ? err.status : 500;
      throw new Error(status === 429 || status === 402 ? message : `${message}`);
    }
  });
