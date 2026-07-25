import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/exports")({
  head: () => ({ meta: [{ title: "Exports — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  component: ExportsPage,
});

function ExportsPage() {
  return (
    <AppShell>
      <div>
        <h1 className="text-display text-3xl">Exports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your downloaded creations.</p>
      </div>
      <div className="mt-8 surface-card flex flex-col items-center justify-center gap-3 p-16 text-center">
        <Download className="h-8 w-8 text-muted-foreground" />
        <p className="text-base font-medium">No exports yet</p>
        <p className="text-sm text-muted-foreground">Export a design or video and it will appear here.</p>
      </div>
    </AppShell>
  );
}
