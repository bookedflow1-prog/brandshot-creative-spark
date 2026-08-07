import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import {
  Type, ImagePlus, Square, Circle as CircleIcon, Undo2, Redo2, Download, Save,
  Palette, ZoomIn, ZoomOut, Maximize2, Hand, Sparkles, Crop,
} from "lucide-react";
import { toast } from "sonner";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { ASPECT_RATIOS, CUSTOM_PROPS, TEXT_PRESETS, uid, type LvObject } from "./editor-utils";

type Props = {
  initialCanvas: unknown;
  width: number;
  height: number;
  onSave: (json: unknown, thumbnail: string, w: number, h: number) => Promise<void>;
  saving?: boolean;
  savedLabel?: string;
  /** Product projects keep the main product layer protected from destructive edits. */
  protectProduct?: boolean;
  /** Signed image URL dropped onto the canvas on first load. */
  seedImageUrl?: string | null;
};

const MAX_HISTORY = 50;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 8;
const EXPORT_SCALES = [1, 2, 3] as const;

export function FabricEditor({
  initialCanvas, width, height, onSave, saving, savedLabel, protectProduct, seedImageUrl,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fcRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef({ stack: [] as string[], index: -1, suspend: false });
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const artboardRef = useRef({ w: width, h: height });
  const panningRef = useRef(false);
  const spaceRef = useRef(false);
  const wheelHandlerRef = useRef<(e: WheelEvent) => void>(() => {});

  const [artboard, setArtboard] = useState({ w: width, h: height });
  const [selected, setSelected] = useState<LvObject | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layers, setLayers] = useState<LvObject[]>([]);
  const [dirty, setDirty] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  /* ------------------------------- helpers ------------------------------- */

  const contentObjects = (fc: fabric.Canvas) =>
    fc.getObjects().filter((o) => (o as LvObject).lvRole !== "background");

  const refreshLayers = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    setLayers([...contentObjects(fc)].reverse() as LvObject[]);
  }, []);

  const doSave = useCallback(async () => {
    const fc = fcRef.current;
    if (!fc) return;
    const json = fc.toObject(CUSTOM_PROPS as unknown as string[]);
    const vpt = [...fc.viewportTransform] as fabric.TMat2D;
    fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const thumb = fc.toDataURL({
      format: "png",
      multiplier: 320 / artboardRef.current.w,
      left: 0, top: 0, width: artboardRef.current.w, height: artboardRef.current.h,
    });
    fc.setViewportTransform(vpt);
    await onSave(json, thumb, artboardRef.current.w, artboardRef.current.h);
    setDirty(false);
  }, [onSave]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { void doSave().catch(() => {}); }, 1500);
  }, [doSave]);

  const pushHistory = useCallback(() => {
    const fc = fcRef.current;
    if (!fc || historyRef.current.suspend) return;
    const json = JSON.stringify(fc.toObject(CUSTOM_PROPS as unknown as string[]));
    const h = historyRef.current;
    if (h.stack[h.index] === json) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(json);
    if (h.stack.length > MAX_HISTORY) h.stack.shift();
    h.index = h.stack.length - 1;
    setCanUndo(h.index > 0);
    setCanRedo(false);
    setDirty(true);
    scheduleAutosave();
  }, [scheduleAutosave]);

  const markLive = useCallback(() => setDirty(true), []);

  /* --------------------------- zoom / pan / fit -------------------------- */

  const applyZoom = useCallback((next: number, anchor?: { x: number; y: number }) => {
    const fc = fcRef.current;
    if (!fc) return;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    const point = anchor ?? { x: fc.getWidth() / 2, y: fc.getHeight() / 2 };
    fc.zoomToPoint(new fabric.Point(point.x, point.y), clamped);
    setZoom(clamped);
    fc.requestRenderAll();
  }, []);

  const fitToScreen = useCallback(() => {
    const fc = fcRef.current;
    const wrap = wrapRef.current;
    if (!fc || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    fc.setDimensions({ width: rect.width, height: rect.height });
    const { w, h } = artboardRef.current;
    const scale = Math.min((rect.width - 80) / w, (rect.height - 80) / h);
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
    fc.setViewportTransform([z, 0, 0, z, (rect.width - w * z) / 2, (rect.height - h * z) / 2]);
    setZoom(z);
    fc.requestRenderAll();
  }, []);

  /* ------------------------------ artboard ------------------------------- */

  const ensureBackground = useCallback((fc: fabric.Canvas, color = "#ffffff") => {
    let bg = fc.getObjects().find((o) => (o as LvObject).lvRole === "background") as fabric.Rect | undefined;
    if (!bg) {
      bg = new fabric.Rect({
        left: 0, top: 0, width: artboardRef.current.w, height: artboardRef.current.h,
        fill: color, selectable: false, evented: false, hoverCursor: "default",
      });
      (bg as LvObject).lvRole = "background";
      (bg as LvObject).lvId = "artboard";
      fc.add(bg);
    }
    fc.sendObjectToBack(bg);
    return bg;
  }, []);

  const placeImage = useCallback((fc: fabric.Canvas, img: fabric.FabricImage, name: string) => {
    const { w, h } = artboardRef.current;
    const scale = Math.min((w * 0.8) / (img.width || 1), (h * 0.8) / (img.height || 1));
    img.scale(scale);
    img.set({ left: (w - (img.width || 0) * scale) / 2, top: (h - (img.height || 0) * scale) / 2 });
    (img as LvObject).lvId = uid();
    (img as LvObject).lvName = name;
    fc.add(img);
    fc.setActiveObject(img);
    fc.requestRenderAll();
  }, []);

  const setArtboardSize = useCallback((w: number, h: number) => {
    const fc = fcRef.current;
    if (!fc) return;
    artboardRef.current = { w, h };
    setArtboard({ w, h });
    ensureBackground(fc).set({ width: w, height: h, scaleX: 1, scaleY: 1, left: 0, top: 0 });
    fc.requestRenderAll();
    fitToScreen();
    pushHistory();
  }, [ensureBackground, fitToScreen, pushHistory]);

  /* -------------------------------- init --------------------------------- */

  useEffect(() => {
    if (!canvasElRef.current) return;
    const fc = new fabric.Canvas(canvasElRef.current, {
      preserveObjectStacking: true,
      backgroundColor: "transparent",
      selection: true,
    });
    fcRef.current = fc;

    const init = async () => {
      historyRef.current.suspend = true;
      const hasContent =
        initialCanvas && typeof initialCanvas === "object" && (initialCanvas as { objects?: unknown[] }).objects?.length;
      if (hasContent) {
        try { await fc.loadFromJSON(initialCanvas as object); } catch (e) { console.error(e); }
      }
      ensureBackground(fc);
      for (const o of fc.getObjects()) {
        const lv = o as LvObject;
        if (!lv.lvId) lv.lvId = uid();
      }
      if (seedImageUrl) {
        try {
          const img = await fabric.FabricImage.fromURL(seedImageUrl, { crossOrigin: "anonymous" });
          placeImage(fc, img, "Product");
          if (protectProduct) img.set({ lockScalingFlip: true });
        } catch (e) { console.error(e); toast.error("Could not load that image"); }
      }
      fc.renderAll();
      historyRef.current.suspend = false;
      pushHistory();
      refreshLayers();
      fitToScreen();
    };
    void init();

    const syncSelection = () => {
      const active = fc.getActiveObjects() as LvObject[];
      setSelectedIds(active.map((o) => o.lvId ?? ""));
      setSelected((fc.getActiveObject() as LvObject) ?? null);
    };
    fc.on("selection:created", syncSelection);
    fc.on("selection:updated", syncSelection);
    fc.on("selection:cleared", () => { setSelected(null); setSelectedIds([]); });
    fc.on("object:added", () => { refreshLayers(); pushHistory(); });
    fc.on("object:removed", () => { refreshLayers(); pushHistory(); });
    fc.on("object:modified", () => { refreshLayers(); pushHistory(); });

    // Alt / space / middle-mouse panning
    const panState = { x: 0, y: 0 };
    fc.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey || spaceRef.current || evt.button === 1) {
        panningRef.current = true;
        fc.selection = false;
        panState.x = evt.clientX;
        panState.y = evt.clientY;
      }
    });
    fc.on("mouse:move", (opt) => {
      if (!panningRef.current) return;
      const evt = opt.e as MouseEvent;
      const vpt = fc.viewportTransform;
      vpt[4] += evt.clientX - panState.x;
      vpt[5] += evt.clientY - panState.y;
      panState.x = evt.clientX;
      panState.y = evt.clientY;
      fc.requestRenderAll();
    });
    fc.on("mouse:up", () => {
      if (!panningRef.current) return;
      panningRef.current = false;
      fc.selection = true;
      fc.setViewportTransform(fc.viewportTransform);
    });

    wheelHandlerRef.current = (e: WheelEvent) => {
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        applyZoom(fc.getZoom() * Math.exp(-dy * 0.0015), { x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        const vpt = fc.viewportTransform;
        vpt[4] -= e.deltaX * (e.deltaMode === 1 ? 16 : 1);
        vpt[5] -= dy;
        fc.setViewportTransform(vpt);
      }
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); wheelHandlerRef.current(e); };
    const wrap = wrapRef.current;
    wrap?.addEventListener("wheel", onWheel, { passive: false });

    const ro = new ResizeObserver(() => fitToScreen());
    if (wrap) ro.observe(wrap);

    return () => {
      wrap?.removeEventListener("wheel", onWheel);
      ro.disconnect();
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      void fc.dispose();
      fcRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ keyboard -------------------------------- */

  useEffect(() => {
    const isField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const fc = fcRef.current;
      if (!fc || isField(e.target)) return;
      if (fc.getActiveObject() instanceof fabric.IText && (fc.getActiveObject() as fabric.IText).isEditing) return;
      if (e.code === "Space") { spaceRef.current = true; setSpaceHeld(true); e.preventDefault(); return; }
      const meta = e.metaKey || e.ctrlKey;
      const active = fc.getActiveObject();
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (meta && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (meta && e.key.toLowerCase() === "s") { e.preventDefault(); void doSave(); }
      else if (meta && e.key.toLowerCase() === "d") { e.preventDefault(); void duplicateSelected(); }
      else if (meta && e.key === "0") { e.preventDefault(); fitToScreen(); }
      else if ((e.key === "Backspace" || e.key === "Delete") && active) { e.preventDefault(); deleteSelected(); }
      else if (active && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowLeft") active.set({ left: (active.left ?? 0) - step });
        if (e.key === "ArrowRight") active.set({ left: (active.left ?? 0) + step });
        if (e.key === "ArrowUp") active.set({ top: (active.top ?? 0) - step });
        if (e.key === "ArrowDown") active.set({ top: (active.top ?? 0) + step });
        active.setCoords();
        fc.requestRenderAll();
        pushHistory();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") { spaceRef.current = false; setSpaceHeld(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------- actions -------------------------------- */

  const addText = (preset: keyof typeof TEXT_PRESETS) => {
    const fc = fcRef.current!;
    const { fontSize, fontWeight, lvName } = TEXT_PRESETS[preset];
    const t = new fabric.IText(preset === "body" ? "Your text here" : "Headline", {
      left: artboardRef.current.w * 0.1,
      top: artboardRef.current.h * 0.1,
      fontFamily: "Inter", fontSize, fontWeight, fill: "#111827",
    });
    (t as LvObject).lvId = uid();
    (t as LvObject).lvName = lvName;
    fc.add(t); fc.setActiveObject(t); fc.requestRenderAll();
  };

  const addShape = (kind: "rect" | "circle") => {
    const fc = fcRef.current!;
    const o = kind === "rect"
      ? new fabric.Rect({ left: 120, top: 120, width: 320, height: 220, fill: "#10b981", rx: 16, ry: 16 })
      : new fabric.Circle({ left: 140, top: 140, radius: 140, fill: "#111827" });
    (o as LvObject).lvId = uid();
    fc.add(o); fc.setActiveObject(o); fc.requestRenderAll();
  };

  const addImageFromFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      placeImage(fcRef.current!, img, file.name);
    } catch (e) {
      console.error(e); toast.error("Could not load image");
    } finally { URL.revokeObjectURL(url); }
  };

  const setBackground = (color: string) => {
    const fc = fcRef.current!;
    ensureBackground(fc).set({ fill: color });
    fc.requestRenderAll(); pushHistory();
  };

  const deleteSelected = () => {
    const fc = fcRef.current!;
    fc.getActiveObjects().forEach((o) => { if ((o as LvObject).lvRole !== "background") fc.remove(o); });
    fc.discardActiveObject(); fc.requestRenderAll();
  };

  const duplicateSelected = async (target?: LvObject) => {
    const fc = fcRef.current!;
    const active = target ?? (fc.getActiveObject() as LvObject | null);
    if (!active) return;
    const clone = await active.clone(CUSTOM_PROPS as unknown as string[]);
    (clone as LvObject).lvId = uid();
    clone.set({ left: (active.left ?? 0) + 24, top: (active.top ?? 0) + 24 });
    fc.add(clone); fc.setActiveObject(clone); fc.requestRenderAll();
  };

  const toggleLock = (target?: LvObject) => {
    const fc = fcRef.current!;
    const a = target ?? (fc.getActiveObject() as LvObject | null);
    if (!a) return;
    const locked = !a.lockMovementX;
    a.set({
      lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked,
      lockRotation: locked, hasControls: !locked, selectable: true,
    });
    fc.requestRenderAll(); refreshLayers(); pushHistory();
  };

  const toggleVisible = (target?: LvObject) => {
    const fc = fcRef.current!;
    const a = target ?? (fc.getActiveObject() as LvObject | null);
    if (!a) return;
    a.set({ visible: a.visible === false });
    fc.requestRenderAll(); refreshLayers(); pushHistory();
  };

  const reorderLayers = (from: number, to: number) => {
    const fc = fcRef.current!;
    const list = [...contentObjects(fc)].reverse(); // top-first
    const moved = list[from];
    if (!moved) return;
    list.splice(from, 1);
    list.splice(to, 0, moved);
    list.reverse().forEach((o, i) => fc.moveObjectTo(o, i + 1)); // index 0 = artboard
    fc.requestRenderAll(); refreshLayers(); pushHistory();
  };

  const bringForward = () => {
    const fc = fcRef.current!; const a = fc.getActiveObject();
    if (!a) return;
    fc.bringObjectForward(a); fc.requestRenderAll(); refreshLayers(); pushHistory();
  };
  const sendBackward = () => {
    const fc = fcRef.current!; const a = fc.getActiveObject();
    if (!a) return;
    fc.sendObjectBackwards(a);
    const bg = fc.getObjects().find((o) => (o as LvObject).lvRole === "background");
    if (bg) fc.sendObjectToBack(bg);
    fc.requestRenderAll(); refreshLayers(); pushHistory();
  };

  const restore = (json: string) => {
    const fc = fcRef.current!;
    const h = historyRef.current;
    h.suspend = true;
    void fc.loadFromJSON(JSON.parse(json)).then(() => {
      ensureBackground(fc);
      fc.renderAll();
      h.suspend = false;
      refreshLayers();
      setCanUndo(h.index > 0);
      setCanRedo(h.index < h.stack.length - 1);
      setDirty(true);
      scheduleAutosave();
    });
  };
  const undo = () => { const h = historyRef.current; if (h.index <= 0) return; h.index--; restore(h.stack[h.index]); };
  const redo = () => { const h = historyRef.current; if (h.index >= h.stack.length - 1) return; h.index++; restore(h.stack[h.index]); };

  /** Exports at true artboard resolution, independent of the on-screen zoom. */
  const exportImage = (format: "png" | "jpeg" | "webp", scale: number) => {
    const fc = fcRef.current!;
    const vpt = [...fc.viewportTransform] as fabric.TMat2D;
    fc.discardActiveObject();
    fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = fc.toDataURL({
      format: format as "png" | "jpeg",
      multiplier: scale,
      quality: 0.95,
      left: 0, top: 0, width: artboardRef.current.w, height: artboardRef.current.h,
    });
    fc.setViewportTransform(vpt);
    fc.requestRenderAll();
    const ext = format === "jpeg" ? "jpg" : format;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `brandshot-${artboardRef.current.w * scale}x${artboardRef.current.h * scale}.${ext}`;
    a.click();
    setExportOpen(false);
    toast.success(`Exported ${ext.toUpperCase()} · ${artboardRef.current.w * scale}×${artboardRef.current.h * scale}`);
  };

  /* -------------------------------- render -------------------------------- */

  const activeRatio = ASPECT_RATIOS.find((r) => r.w === artboard.w && r.h === artboard.h);

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-2 lg:flex-row">
      {/* Tool rail */}
      <div className="order-2 flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5 lg:order-1 lg:w-[70px] lg:flex-col lg:items-stretch lg:overflow-visible lg:p-2">
        <ToolBtn icon={<Type className="h-4 w-4" />} label="Heading" onClick={() => addText("heading")} />
        <ToolBtn icon={<Type className="h-3.5 w-3.5" />} label="Text" onClick={() => addText("body")} />
        <label className="flex min-w-[58px] cursor-pointer flex-col items-center gap-1 rounded-lg p-2 text-[10px] text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <ImagePlus className="h-4 w-4" />
          <span>Image</span>
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void addImageFromFile(f); e.currentTarget.value = ""; }} />
        </label>
        <ToolBtn icon={<Square className="h-4 w-4" />} label="Shape" onClick={() => addShape("rect")} />
        <ToolBtn icon={<CircleIcon className="h-4 w-4" />} label="Circle" onClick={() => addShape("circle")} />
        <label className="flex min-w-[58px] cursor-pointer flex-col items-center gap-1 rounded-lg p-2 text-[10px] text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <Palette className="h-4 w-4" />
          <span>Canvas</span>
          <input type="color" className="hidden" onChange={(e) => setBackground(e.target.value)} />
        </label>
      </div>

      {/* Canvas column */}
      <div className="order-1 flex min-h-[420px] flex-1 flex-col lg:order-2">
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1.5">
          <Button size="sm" variant="ghost" onClick={undo} disabled={!canUndo} aria-label="Undo"><Undo2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={redo} disabled={!canRedo} aria-label="Redo"><Redo2 className="h-4 w-4" /></Button>
          <div className="mx-1 h-5 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Crop className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            {ASPECT_RATIOS.map((r) => (
              <button key={r.label} title={r.hint} onClick={() => setArtboardSize(r.w, r.h)}
                className={`rounded-md px-2 py-1 text-[11px] transition ${activeRatio?.label === r.label ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button size="sm" variant="ghost" onClick={() => applyZoom(zoom * 0.9)} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></Button>
          <span className="w-11 text-center text-[11px] tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="ghost" onClick={() => applyZoom(zoom * 1.1)} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={fitToScreen} aria-label="Fit to screen"><Maximize2 className="h-4 w-4" /></Button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              {dirty ? "Unsaved changes" : savedLabel ?? "All changes saved"}
            </span>
            <Button size="sm" variant="ghost" onClick={() => void doSave()} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save"}
            </Button>
            <div className="relative">
              <Button size="sm" onClick={() => setExportOpen((v) => !v)}>
                <Download className="mr-1.5 h-4 w-4" />Export
              </Button>
              {exportOpen && (
                <div className="absolute right-0 z-30 mt-1 w-60 rounded-xl border border-border bg-popover p-2 shadow-lift">
                  <p className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Download</p>
                  {(["png", "jpeg", "webp"] as const).map((f) => (
                    <div key={f} className="flex items-center gap-1 px-1 py-0.5">
                      <span className="w-12 text-xs uppercase">{f === "jpeg" ? "jpg" : f}</span>
                      {EXPORT_SCALES.map((s) => (
                        <button key={s} onClick={() => exportImage(f, s)}
                          className="flex-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted">
                          {s}×
                        </button>
                      ))}
                    </div>
                  ))}
                  <p className="px-2 pt-2 text-[10px] text-muted-foreground">
                    Base resolution {artboard.w}×{artboard.h}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          ref={wrapRef}
          className={`relative flex-1 overflow-hidden rounded-xl border border-border bg-muted/40 ${spaceHeld ? "cursor-grab" : ""}`}
        >
          <canvas ref={canvasElRef} />
          <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur">
            <Hand className="h-3 w-3" /> Space or Alt + drag to pan · ⌘/Ctrl + scroll to zoom
          </div>
          {protectProduct && (
            <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] text-primary">
              <Sparkles className="h-3 w-3" /> Product protection on
            </div>
          )}
        </div>
      </div>

      {/* Right panels */}
      <div className="order-3 flex shrink-0 flex-col gap-2 lg:w-64">
        {selected && fcRef.current && (
          <div className="rounded-xl border border-border bg-card">
            <PropertiesPanel
              canvas={fcRef.current}
              selected={selected}
              artboard={artboard}
              commit={pushHistory}
              live={markLive}
              onDelete={deleteSelected}
              onDuplicate={() => void duplicateSelected()}
              onBringForward={bringForward}
              onSendBackward={sendBackward}
            />
          </div>
        )}
        <div className="min-h-[180px] flex-1 rounded-xl border border-border bg-card">
          <LayersPanel
            layers={layers}
            selectedIds={selectedIds}
            onSelect={(o, additive) => {
              const fc = fcRef.current!;
              if (additive) {
                const current = fc.getActiveObjects();
                fc.discardActiveObject();
                fc.setActiveObject(new fabric.ActiveSelection([...current, o], { canvas: fc }));
              } else {
                fc.setActiveObject(o);
              }
              fc.requestRenderAll();
            }}
            onToggleVisible={toggleVisible}
            onToggleLock={toggleLock}
            onDelete={(o) => { const fc = fcRef.current!; fc.remove(o); fc.requestRenderAll(); }}
            onDuplicate={(o) => void duplicateSelected(o)}
            onReorder={reorderLayers}
            onRename={(o, name) => { o.lvName = name; refreshLayers(); pushHistory(); }}
          />
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-w-[58px] flex-col items-center gap-1 rounded-lg p-2 text-[10px] text-muted-foreground transition hover:bg-muted hover:text-foreground">
      {icon}<span>{label}</span>
    </button>
  );
}
