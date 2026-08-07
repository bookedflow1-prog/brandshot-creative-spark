/** Server-only helpers for AI product-photo generation via the Lovable AI Gateway. */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const IMAGE_MODEL = "google/gemini-3.1-flash-image";

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

/**
 * Calls the gateway and returns the generated image as a base64 data URL.
 * Throws AiGatewayError with the provider status so callers can surface real failures.
 */
export async function generateImage(opts: {
  prompt: string;
  inputImages?: string[]; // data URLs
  model?: string;
}): Promise<{ dataUrl: string; model: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiGatewayError(500, "AI provider is not configured (missing key).");

  const model = opts.model ?? IMAGE_MODEL;
  const parts: ContentPart[] = [{ type: "text", text: opts.prompt }];
  for (const url of opts.inputImages ?? []) parts.push({ type: "image_url", image_url: { url } });

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: parts }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new AiGatewayError(429, "AI rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new AiGatewayError(402, "AI credits exhausted for this workspace.");
    throw new AiGatewayError(res.status, `AI provider error (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
  };
  const dataUrl = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) throw new AiGatewayError(502, "The AI provider returned no image.");
  return { dataUrl, model };
}

export function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) throw new Error("Unexpected image payload");
  const mime = match[1];
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime };
}
