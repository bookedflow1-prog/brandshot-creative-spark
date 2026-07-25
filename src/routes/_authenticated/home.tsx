import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Palette, ImagePlus, Video, ArrowRight, Coins, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Home — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  component: HomePage,
});

const actions = [
  { to: "/create", label: "AI Photo", desc: "Make it professional", icon: Wand2, tone: "from-primary/20 to-primary/5" },
  { to: "/editor", label: "Design", desc: "Compose in the editor", icon: Palette, tone: "from-accent to-surface-elevated" },
  { to: "/create", label: "Edit Photo", desc: "Enhance or transform", icon: ImagePlus, tone: "from-primary/15 to-transparent" },
  { to: "/video", label: "Video", desc: "Short vertical video", icon: Video, tone: "from-foreground/10 to-transparent" },
] as const;

function HomePage() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("display_name,credits").eq("id", u.user.id).maybeSingle();
      return data;
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id,title,type,cover_url,updated_at").order("updated_at", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  const firstName = (profile?.display_name ?? "").split(" ")[0];

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{firstName ? `Hi ${firstName}` : "Welcome"}</p>
          <h1 className="mt-1 text-display text-3xl md:text-4xl">What do you want to create today?</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-sm">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-medium">{profile?.credits ?? 0}</span>
          <span className="text-muted-foreground">credits</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.label} to={a.to}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${a.tone} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift`}>
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-8 text-base font-semibold">{a.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
              <ArrowRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recent.map((p) => (
              <div key={p.id} className="surface-card overflow-hidden">
                <div className="aspect-square bg-muted" />
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card flex flex-col items-center justify-center gap-3 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-medium">No projects yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Start by uploading your first image.</p>
            </div>
            <Link to="/create" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Create your first project <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
