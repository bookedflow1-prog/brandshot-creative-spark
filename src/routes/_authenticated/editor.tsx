import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Palette, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/editor")({
  head: () => ({ meta: [{ title: "Editor — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  component: EditorPage,
});

function EditorPage() {
  return (
    <AppShell>
      <div>
        <h1 className="text-display text-3xl">Magic Editor</h1>
        <p className="mt-1 text-sm text-muted-foreground">Open a project to start editing.</p>
      </div>
      <div className="mt-8 surface-card flex flex-col items-center justify-center gap-3 p-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Palette className="h-5 w-5" />
        </span>
        <p className="text-base font-medium">Editor is being prepared</p>
        <p className="max-w-sm text-sm text-muted-foreground">Your Magic Editor with layers, text, shapes and AI tools is next in the roadmap. Projects and uploads are ready.</p>
      </div>
    </AppShell>
  );
}
