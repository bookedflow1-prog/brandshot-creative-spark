import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Type, ImagePlus, Square, Circle as CircleIcon, Trash2, Copy, Lock, Unlock,
  Eye, EyeOff, Undo2, Redo2, Download, Save, ArrowUpToLine, ArrowDownToLine,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  initialCanvas: unknown;
  width: number;
  height: number;
  onSave: (json: unknown, thumbnail: string, w: number, h: number) => Promise<void>;
  saving?: boolean;
  savedLabel?: string;
};

const MAX_HISTORY = 40;

export function FabricEditor({ initialCanvas, width, height, onSave, saving, savedLabel }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fcRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<{ stack: string[]; index: number; suspend: boolean }>({ stack: [], index: -1, suspend: false });
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<fabric.Object | null>(null);
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [dirty, setDirty] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);

  const refreshLayers = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    setLayers([...fc.getObjects()].reverse());
  }, []);

  const pushHistory = useCallback(() => {
    const fc = fcRef.current;
    if (!fc || historyRef.current.suspend) return;
    const json = JSON.stringify(fc.toJSON());
    const h = historyRef.current;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(json);
    if (h.stack.length > MAX_HISTORY) h.stack.shift();
    h.index = h.stack.length - 1;
    setCanUndo(h.index > 0);
    setCanRedo(false);
    setDirty(true);
    scheduleAutosave();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = useCallback(async () => {
    const fc = fcRef.current;
    if (!fc) return;
    const json = fc.toJSON();
    const thumb = fc.toDataURL({ format: "png", multiplier: 0.25 });
    await onSave(json, thumb, fc.getWidth(), fc.getHeight());
    setDirty(false);
  }, [onSave]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { doSave().catch(() => {}); }, 1500);
  }, [doSave]);

  // Fit canvas to container
  const fitToContainer = useCallback(() => {
    const fc = fcRef.current;
    const wrap = wrapRef.current;
    if (!fc || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const pad = 32;
    const scale = Math.min((rect.width - pad) / fc.getWidth(), (rect.height - pad) / fc.getHeight(), 1);
    fc.setZoom(scale);
    fc.setDimensions({ width: fc.getWidth() * scale, height: fc.getHeight() * scale }, { cssOnly: true });
    setZoom(scale);
  }, []);

  useEffect(() => {
    if (!canvasElRef.current) return;
    const fc = new fabric.Canvas(canvasElRef.current, {
      width, height, backgroundColor: "#ffffff", preserveObjectStacking: true,
    });
    fcRef.current = fc;

    const init = async () => {
      const hasContent = initialCanvas && typeof initialCanvas === "object" && (initialCanvas as { objects?: unknown[] }).objects?.length;
      if (hasContent) {
        historyRef.current.suspend = true;
        try { await fc.loadFromJSON(initialCanvas as object); fc.renderAll(); } catch (e) { console.error(e); }
        historyRef.current.suspend = false;
      }
      pushHistory();
      refreshLayers();
      fitToContainer();
    };
    init();

    const onSel = () => setSelected(fc.getActiveObject() ?? null);
    fc.on("selection:created", onSel);
    fc.on("selection:updated", onSel);
    fc.on("selection:cleared", () => setSelected(null));
    fc.on("object:added", () => { refreshLayers(); pushHistory(); });
    fc.on("object:removed", () => { refreshLayers(); pushHistory(); });
    fc.on("object:modified", () => { refreshLayers(); pushHistory(); });

    const onResize = () => fitToContainer();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      fc.dispose();
      fcRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const fc = fcRef.current;
      if (!fc) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (meta && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (meta && e.key.toLowerCase() === "s") { e.preventDefault(); doSave(); }
      else if (meta && e.key.toLowerCase() === "d") { e.preventDefault(); duplicateSelected(); }
      else if ((e.key === "Backspace" || e.key === "Delete") && fc.getActiveObject()) { e.preventDefault(); deleteSelected(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actions
  const addText = () => {
    const fc = fcRef.current!;
    const t = new fabric.IText("Double-click to edit", { left: 100, top: 100, fontFamily: "Inter", fontSize: 48, fill: "#111827" });
    fc.add(t); fc.setActiveObject(t); fc.requestRenderAll();
  };
  const addRect = () => {
    const fc = fcRef.current!;
    const r = new fabric.Rect({ left: 120, top: 120, width: 240, height: 160, fill: "#10b981", rx: 12, ry: 12 });
    fc.add(r); fc.setActiveObject(r); fc.requestRenderAll();
  };
  const addCircle = () => {
    const fc = fcRef.current!;
    const c = new fabric.Circle({ left: 140, top: 140, radius: 100, fill: "#111827" });
    fc.add(c); fc.setActiveObject(c); fc.requestRenderAll();
  };
  const addImageFromFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const fc = fcRef.current!;
      const scale = Math.min((fc.getWidth() * 0.6) / (img.width || 1), (fc.getHeight() * 0.6) / (img.height || 1), 1);
      img.scale(scale);
      img.set({ left: 60, top: 60 });
      fc.add(img); fc.setActiveObject(img); fc.requestRenderAll();
    } catch (e) {
      console.error(e); toast.error("Could not load image");
    } finally { URL.revokeObjectURL(url); }
  };
  const setBackground = (color: string) => {
    const fc = fcRef.current!;
    fc.backgroundColor = color;
    fc.requestRenderAll(); pushHistory();
  };

  const deleteSelected = () => {
    const fc = fcRef.current!;
    const objs = fc.getActiveObjects();
    objs.forEach((o) => fc.remove(o));
    fc.discardActiveObject(); fc.requestRenderAll();
  };
  const duplicateSelected = async () => {
    const fc = fcRef.current!;
    const active = fc.getActiveObject(); if (!active) return;
    const clone = await active.clone();
    clone.set({ left: (active.left ?? 0) + 20, top: (active.top ?? 0) + 20 });
    fc.add(clone); fc.setActiveObject(clone); fc.requestRenderAll();
  };
  const toggleLock = () => {
    const fc = fcRef.current!;
    const a = fc.getActiveObject(); if (!a) return;
    const locked = !a.lockMovementX;
    a.set({ lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked, lockRotation: locked, hasControls: !locked });
    fc.requestRenderAll(); setSelected({ ...a } as fabric.Object); pushHistory();
  };
  const toggleVisible = () => {
    const fc = fcRef.current!;
    const a = fc.getActiveObject(); if (!a) return;
    a.set({ visible: !a.visible }); fc.requestRenderAll(); setSelected({ ...a } as fabric.Object); pushHistory();
  };
  const setOpacity = (v: number) => {
    const fc = fcRef.current!;
    const a = fc.getActiveObject(); if (!a) return;
    a.set({ opacity: v }); fc.requestRenderAll();
  };
  const bringForward = () => { const fc = fcRef.current!; const a = fc.getActiveObject(); if (a) { fc.bringObjectForward(a); fc.requestRenderAll(); refreshLayers(); pushHistory(); } };
  const sendBackward = () => { const fc = fcRef.current!; const a = fc.getActiveObject(); if (a) { fc.sendObjectBackwards(a); fc.requestRenderAll(); refreshLayers(); pushHistory(); } };

  const undo = () => {
    const fc = fcRef.current!; const h = historyRef.current;
    if (h.index <= 0) return;
    h.index--; h.suspend = true;
    fc.loadFromJSON(JSON.parse(h.stack[h.index])).then(() => { fc.renderAll(); h.suspend = false; refreshLayers(); setCanUndo(h.index > 0); setCanRedo(h.index < h.stack.length - 1); setDirty(true); scheduleAutosave(); });
  };
  const redo = () => {
    const fc = fcRef.current!; const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index++; h.suspend = true;
    fc.loadFromJSON(JSON.parse(h.stack[h.index])).then(() => { fc.renderAll(); h.suspend = false; refreshLayers(); setCanUndo(h.index > 0); setCanRedo(h.index < h.stack.length - 1); setDirty(true); scheduleAutosave(); });
  };

  const exportImage = (format: "png" | "jpeg") => {
    const fc = fcRef.current!;
    // Render at natural size regardless of current zoom
    const dataUrl = fc.toDataURL({ format, multiplier: 1 / (fc.getZoom() || 1), quality: 0.92 });
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `brandshot-${Date.now()}.${format === "jpeg" ? "jpg" : "png"}`; a.click();
  };

  const isText = selected && (selected.type === "i-text" || selected.type === "text" || selected.type === "textbox");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3 md:flex-row">
      {/* Left tool rail */}
      <div className="order-2 flex shrink-0 flex-wrap gap-2 rounded-xl border border-border bg-card p-2 md:order-1 md:w-16 md:flex-col">
        <ToolBtn icon={<Type className="h-4 w-4" />} label="Text" onClick={addText} />
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
          <ImagePlus className="h-4 w-4" />
          <span>Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImageFromFile(f); e.currentTarget.value = ""; }} />
        </label>
        <ToolBtn icon={<Square className="h-4 w-4" />} label="Rect" onClick={addRect} />
        <ToolBtn icon={<CircleIcon className="h-4 w-4" />} label="Circle" onClick={addCircle} />
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
          <Palette className="h-4 w-4" />
          <span>BG</span>
          <input type="color" className="hidden" onChange={(e) => setBackground(e.target.value)} />
        </label>
      </div>

      {/* Canvas area */}
      <div className="order-1 flex min-h-[420px] flex-1 flex-col md:order-2">
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
          <Button size="sm" variant="ghost" onClick={undo} disabled={!canUndo}><Undo2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={redo} disabled={!canRedo}><Redo2 className="h-4 w-4" /></Button>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button size="sm" variant="ghost" onClick={() => doSave()} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => exportImage("png")}><Download className="mr-1.5 h-4 w-4" />PNG</Button>
          <Button size="sm" variant="ghost" onClick={() => exportImage("jpeg")}>JPG</Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {dirty ? "Unsaved changes" : savedLabel ?? "All changes saved"} · {Math.round(zoom * 100)}%
          </div>
        </div>

        <div ref={wrapRef} className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-border bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] p-4">
          <canvas ref={canvasElRef} className="shadow-soft" />
        </div>

        {selected && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 text-sm">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{selected.type}</span>
            <Button size="sm" variant="ghost" onClick={duplicateSelected}><Copy className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={toggleLock}>{selected.lockMovementX ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</Button>
            <Button size="sm" variant="ghost" onClick={toggleVisible}>{selected.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
            <Button size="sm" variant="ghost" onClick={bringForward}><ArrowUpToLine className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={sendBackward}><ArrowDownToLine className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs text-muted-foreground">Opacity</span>
              <div className="w-28"><Slider defaultValue={[Math.round((selected.opacity ?? 1) * 100)]} max={100} step={1} onValueChange={(v) => setOpacity((v[0] ?? 100) / 100)} /></div>
            </div>
            {isText && (
              <input
                type="color"
                defaultValue={typeof (selected as fabric.IText).fill === "string" ? ((selected as fabric.IText).fill as string) : "#111827"}
                onChange={(e) => { const t = selected as fabric.IText; t.set({ fill: e.target.value }); fcRef.current?.requestRenderAll(); }}
                className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
                aria-label="Text color"
              />
            )}
            <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={deleteSelected}><Trash2 className="h-4 w-4" /></Button>
          </div>
        )}
      </div>

      {/* Layers panel */}
      <div className="order-3 shrink-0 rounded-xl border border-border bg-card p-2 md:w-56">
        <p className="mb-2 px-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Layers</p>
        <div className="max-h-[60vh] space-y-1 overflow-auto md:max-h-[calc(100vh-14rem)]">
          {layers.length === 0 && <p className="px-2 py-4 text-xs text-muted-foreground">Nothing yet. Add text, an image, or a shape.</p>}
          {layers.map((o, i) => {
            const active = selected === o;
            return (
              <button
                key={i}
                onClick={() => { const fc = fcRef.current!; fc.setActiveObject(o); fc.requestRenderAll(); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                {o.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="flex-1 truncate">{o.type ?? "layer"}</span>
                {o.lockMovementX && <Lock className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
      {icon}<span>{label}</span>
    </button>
  );
}
