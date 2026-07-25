import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Package, User, Shirt, UtensilsCrossed, Car, Palette as PaletteIcon, Share2, Sparkles, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

type ProjectType = "product" | "personal" | "fashion" | "food" | "vehicle" | "artwork" | "social" | "other";

const types: { id: ProjectType; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
  { id: "product", label: "Product", icon: Package },
  { id: "personal", label: "Personal Photo", icon: User },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "artwork", label: "Artwork", icon: PaletteIcon },
  { id: "social", label: "Social Content", icon: Share2 },
  { id: "other", label: "Other", icon: Sparkles },
];

const goals = [
  { id: "professional", label: "Make Professional", desc: "Polished, studio look" },
  { id: "background", label: "Change Background", desc: "Swap the scene" },
  { id: "advertisement", label: "Create Advertisement", desc: "Ready-to-post ad" },
  { id: "edit", label: "Edit Image", desc: "Open in editor" },
  { id: "video", label: "Create Video", desc: "Short vertical video" },
  { id: "scratch", label: "Start from Scratch", desc: "Blank design" },
];

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Create — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  component: CreatePage,
});

function CreatePage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<ProjectType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function onFile(f: File) {
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (f.size > 20 * 1024 * 1024) return toast.error("Image is too large (20 MB max)");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleCreate() {
    if (!type) return;
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      const { data: proj, error } = await supabase.from("projects").insert({
        user_id: u.user.id, type, title: goal ? `New ${type} — ${goal}` : `New ${type} project`,
      }).select("id").single();
      if (error) throw error;

      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${u.user.id}/${proj.id}/original-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("user-media").upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        await supabase.from("project_assets").insert({
          project_id: proj.id, user_id: u.user.id, kind: "original", storage_path: path, mime_type: file.type,
        });
      }
      toast.success("Project created");
      navigate({ to: "/projects" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create project");
    } finally { setBusy(false); }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">Step {step} of 4</span>
        </div>

        <div className="surface-card p-8 shadow-soft">
          {step === 1 && (
            <>
              <h1 className="text-display text-3xl">What are you creating?</h1>
              <p className="mt-2 text-muted-foreground">Pick the type closest to your idea.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {types.map((t) => {
                  const Icon = t.icon;
                  const active = type === t.id;
                  return (
                    <button key={t.id} onClick={() => { setType(t.id); setStep(2); }}
                      className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border bg-surface-elevated hover:border-primary/40"}`}>
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-display text-3xl">Upload your image</h1>
              <p className="mt-2 text-muted-foreground">Any photo works. We'll take it from here.</p>
              <label className="mt-6 flex aspect-video cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                {preview ? (
                  <img src={preview} className="h-full w-full rounded-xl object-contain" alt="upload preview" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Click or drop an image</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG or WebP · up to 20 MB</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && onFile(e.target.files[0])} />
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setStep(3)} className="text-sm text-muted-foreground hover:text-foreground">Skip</button>
                <button onClick={() => setStep(3)} disabled={!file}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-display text-3xl">What do you want to do?</h1>
              <p className="mt-2 text-muted-foreground">You can always change this later.</p>
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {goals.map((g) => (
                  <button key={g.id} onClick={() => { setGoal(g.id); setStep(4); }}
                    className={`rounded-xl border p-4 text-left transition-all ${goal === g.id ? "border-primary bg-primary/5" : "border-border bg-surface-elevated hover:border-primary/40"}`}>
                    <p className="text-sm font-medium">{g.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{g.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-display text-3xl">Ready to go</h1>
              <p className="mt-2 text-muted-foreground">We'll save your project so you can generate and edit at any time.</p>
              <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Summary</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row k="Type" v={types.find((t) => t.id === type)?.label ?? "—"} />
                  <Row k="Goal" v={goals.find((g) => g.id === goal)?.label ?? "—"} />
                  <Row k="Image" v={file ? file.name : "None"} />
                </dl>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleCreate} disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create project
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
