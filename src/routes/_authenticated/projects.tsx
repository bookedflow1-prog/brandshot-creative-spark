import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id,title,type,cover_url,updated_at").order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  async function del(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything you've created lives here.</p>
        </div>
        <Link to="/create" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> New project
        </Link>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {projects.map((p) => (
              <div key={p.id} className="group surface-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <div className="aspect-square bg-muted" />
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.type}</p>
                  </div>
                  <button onClick={() => del(p.id)} className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card flex flex-col items-center justify-center gap-3 p-16 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-base font-medium">No projects yet</p>
            <p className="text-sm text-muted-foreground">Create your first project to get started.</p>
            <Link to="/create" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
