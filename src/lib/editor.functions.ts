import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const LoadInput = z.object({ projectId: z.string().uuid() });
export const loadOrCreateScene = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => LoadInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify project ownership
    const { data: project } = await supabase.from("projects").select("id,title,type").eq("id", data.projectId).maybeSingle();
    if (!project) throw new Error("project_not_found");
    const { data: existing } = await supabase
      .from("editor_scenes")
      .select("*")
      .eq("project_id", data.projectId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return { project, scene: existing };
    const { data: created, error } = await supabase
      .from("editor_scenes")
      .insert({ project_id: data.projectId, user_id: userId, name: project.title })
      .select("*")
      .single();
    if (error) throw error;
    return { project, scene: created };
  });

const SaveInput = z.object({
  sceneId: z.string().uuid(),
  canvas: z.any(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  thumbnail: z.string().optional(),
});
export const saveScene = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => SaveInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("editor_scenes")
      .update({ canvas: data.canvas, width: data.width, height: data.height, thumbnail_url: data.thumbnail ?? null })
      .eq("id", data.sceneId);
    if (error) throw error;
    return { ok: true, savedAt: new Date().toISOString() };
  });
