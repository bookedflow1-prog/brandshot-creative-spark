import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Video } from "lucide-react";

export const Route = createFileRoute("/_authenticated/video")({
  head: () => ({ meta: [{ title: "Video — BrandShot AI" }, { name: "robots", content: "noindex" }] }),
  component: VideoPage,
});

function VideoPage() {
  return (
    <AppShell>
      <div>
        <h1 className="text-display text-3xl">Video Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Turn images into short videos.</p>
      </div>
      <div className="mt-8 surface-card flex flex-col items-center justify-center gap-3 p-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Video className="h-5 w-5" />
        </span>
        <p className="text-base font-medium">Video renderer not configured</p>
        <p className="max-w-sm text-sm text-muted-foreground">Video Studio templates and export are ready in the schema. Connect a rendering backend to enable MP4 exports.</p>
      </div>
    </AppShell>
  );
}
