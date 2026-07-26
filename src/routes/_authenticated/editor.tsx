import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { FabricEditor } from "@/components/editor/FabricEditor";
import { loadOrCreateScene, saveScene } from "@/lib/editor.functions";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ project: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/editor")({
  head: () => ({ meta: [{ title: "Magic Editor — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: EditorPage,
});

function EditorPage() {
  const { project: projectId } = useSearch({ from: "/_authenticated/editor" });
  return (
    <AppShell>
      {projectId ? <EditorFor projectId={projectId} /> : <ProjectPicker />}
    </AppShell>
  );
}

function ProjectPicker() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", "for-editor"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id,title,type,cover_url,updated_at").order("updated_at", { ascending: false }).limit(30);
      return data ?? [];
    },
  });
  return (
    <div>
      <h1 className="text-display text-3xl">Magic Editor</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pick a project to open on the canvas.</p>
      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : !projects?.length ? (
        <div className="mt-8 surface-card flex flex-col items-center justify-center gap-3 p-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Palette className="h-5 w-5" /></span>
          <p className="text-base font-medium">No projects yet</p>
          <Link to="/create" className="text-sm text-primary hover:underline">Create your first project →</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} to="/editor" search={{ project: p.id }} className="surface-card flex items-center gap-3 p-4 transition hover:shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><FolderOpen className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{p.type}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorFor({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const load = useServerFn(loadOrCreateScene);
  const save = useServerFn(saveScene);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["editor-scene", projectId],
    queryFn: () => load({ data: { projectId } }),
    staleTime: Infinity,
  });

  const saveMut = useMutation({
    mutationFn: async (input: { json: unknown; thumb: string; w: number; h: number }) => {
      if (!data?.scene) throw new Error("no scene");
      return save({ data: { sceneId: data.scene.id, canvas: input.json, width: input.w, height: input.h, thumbnail: input.thumb } });
    },
    onSuccess: (r) => { setSavedAt(new Date(r.savedAt).toLocaleTimeString()); qc.invalidateQueries({ queryKey: ["projects"] }); },
    onError: () => toast.error("Save failed"),
  });

  useEffect(() => { if (error) toast.error("Could not open project"); }, [error]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Opening editor…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Project not available.</p>;

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{data.project.type}</p>
          <h1 className="text-display text-2xl">{data.project.title}</h1>
        </div>
        <Link to="/editor" search={{}} className="text-xs text-muted-foreground hover:text-foreground">← Switch project</Link>
      </div>
      <FabricEditor
        initialCanvas={data.scene.canvas}
        width={data.scene.width}
        height={data.scene.height}
        saving={saveMut.isPending}
        savedLabel={savedAt ? `Saved ${savedAt}` : undefined}
        onSave={async (json, thumb, w, h) => { await saveMut.mutateAsync({ json, thumb, w, h }); }}
      />
    </div>
  );
}
