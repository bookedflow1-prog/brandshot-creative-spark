import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, Sparkles, FolderOpen, Palette, Video, Download, LogOut, Coins, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/create", label: "Create", icon: Sparkles },
  { to: "/projects", label: "Projects", icon: FolderOpen },
  { to: "/editor", label: "Editor", icon: Palette },
  { to: "/video", label: "Video", icon: Video },
  { to: "/exports", label: "Exports", icon: Download },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("display_name,avatar_url,credits").eq("id", u.user.id).maybeSingle();
      return data;
    },
  });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
    toast.success("Signed out");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">BrandShot AI</span>
        </div>
        <nav className="flex-1 px-3 py-4">
          {nav.map((n) => {
            const active = location.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/60 p-3">
            <Coins className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Credits</p>
              <p className="text-sm font-semibold">{profile?.credits ?? "—"}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <Link to="/home" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold">BrandShot</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
            <Coins className="h-3 w-3 text-primary" />{profile?.credits ?? "—"}
          </span>
          <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-muted"><Menu className="h-5 w-5" /></button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-surface p-5 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 space-y-1">
              {nav.map((n) => {
                const Icon = n.icon;
                return (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                    <Icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={handleSignOut} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-5 py-6 md:px-10 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
