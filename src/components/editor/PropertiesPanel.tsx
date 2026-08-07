import * as fabric from "fabric";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, AlignStartVertical, AlignEndVertical,
  AlignStartHorizontal, AlignEndHorizontal, Bold, Italic, Underline, ArrowUp, ArrowDown, Trash2, Copy,
} from "lucide-react";
import {
  FONTS, alignObject, applyAdjustments, readAdjustments, isImageObject, isTextObject,
  type AlignKind, type LvObject,
} from "./editor-utils";

type Props = {
  canvas: fabric.Canvas;
  selected: LvObject;
  artboard: { w: number; h: number };
  commit: () => void;
  live: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
};

const ALIGNS: { kind: AlignKind; icon: React.ReactNode; label: string }[] = [
  { kind: "left", icon: <AlignStartVertical className="h-4 w-4" />, label: "Align left" },
  { kind: "center-h", icon: <AlignHorizontalJustifyCenter className="h-4 w-4" />, label: "Center horizontally" },
  { kind: "right", icon: <AlignEndVertical className="h-4 w-4" />, label: "Align right" },
  { kind: "top", icon: <AlignStartHorizontal className="h-4 w-4" />, label: "Align top" },
  { kind: "center-v", icon: <AlignVerticalJustifyCenter className="h-4 w-4" />, label: "Center vertically" },
  { kind: "bottom", icon: <AlignEndHorizontal className="h-4 w-4" />, label: "Align bottom" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function PropertiesPanel({
  canvas, selected, artboard, commit, live, onDelete, onDuplicate, onBringForward, onSendBackward,
}: Props) {
  const text = isTextObject(selected) ? (selected as fabric.IText) : null;
  const image = isImageObject(selected) ? (selected as fabric.FabricImage) : null;
  const adj = image ? readAdjustments(image) : null;

  const setProp = (props: Record<string, unknown>, final = true) => {
    selected.set(props);
    canvas.requestRenderAll();
    (final ? commit : live)();
  };

  const setAdj = (patch: Record<string, number | boolean>, final: boolean) => {
    if (!image || !adj) return;
    applyAdjustments(image, { ...adj, ...patch } as typeof adj);
    canvas.requestRenderAll();
    (final ? commit : live)();
  };

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-1">
        <span className="mr-auto truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {selected.type === "i-text" ? "Text" : selected.type}
        </span>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Bring forward" onClick={onBringForward}><ArrowUp className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Send backward" onClick={onSendBackward}><ArrowDown className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Duplicate" onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" aria-label="Delete" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>

      <Row label="Align">
        <div className="grid grid-cols-6 gap-1">
          {ALIGNS.map((a) => (
            <button
              key={a.kind}
              aria-label={a.label}
              title={a.label}
              onClick={() => { alignObject(selected, a.kind, artboard); canvas.requestRenderAll(); commit(); }}
              className="flex items-center justify-center rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {a.icon}
            </button>
          ))}
        </div>
      </Row>

      <Row label={`Opacity · ${Math.round((selected.opacity ?? 1) * 100)}%`}>
        <Slider
          value={[Math.round((selected.opacity ?? 1) * 100)]}
          max={100}
          step={1}
          onValueChange={(v) => setProp({ opacity: (v[0] ?? 100) / 100 }, false)}
          onValueCommit={() => commit()}
        />
      </Row>

      <Row label={`Rotation · ${Math.round(selected.angle ?? 0)}°`}>
        <Slider
          value={[Math.round(selected.angle ?? 0)]}
          max={360}
          step={1}
          onValueChange={(v) => setProp({ angle: v[0] ?? 0 }, false)}
          onValueCommit={() => commit()}
        />
      </Row>

      {text && (
        <>
          <Row label="Font">
            <select
              value={text.fontFamily ?? "Inter"}
              onChange={(e) => setProp({ fontFamily: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            >
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Row>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={8}
              value={Math.round(text.fontSize ?? 32)}
              onChange={(e) => setProp({ fontSize: Number(e.target.value) || 32 })}
              className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              aria-label="Font size"
            />
            <Button size="icon" variant={text.fontWeight === "700" ? "secondary" : "ghost"} className="h-8 w-8" aria-label="Bold"
              onClick={() => setProp({ fontWeight: text.fontWeight === "700" ? "400" : "700" })}><Bold className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant={text.fontStyle === "italic" ? "secondary" : "ghost"} className="h-8 w-8" aria-label="Italic"
              onClick={() => setProp({ fontStyle: text.fontStyle === "italic" ? "normal" : "italic" })}><Italic className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant={text.underline ? "secondary" : "ghost"} className="h-8 w-8" aria-label="Underline"
              onClick={() => setProp({ underline: !text.underline })}><Underline className="h-3.5 w-3.5" /></Button>
            <input
              type="color"
              value={typeof text.fill === "string" ? text.fill : "#111827"}
              onChange={(e) => setProp({ fill: e.target.value })}
              className="ml-auto h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
              aria-label="Text colour"
            />
          </div>
          <Row label="Alignment">
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button key={a} onClick={() => setProp({ textAlign: a })}
                  className={`flex-1 rounded-md border border-border px-2 py-1 text-[11px] capitalize ${text.textAlign === a ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  {a}
                </button>
              ))}
            </div>
          </Row>
        </>
      )}

      {!text && !image && (
        <Row label="Fill">
          <input
            type="color"
            value={typeof selected.fill === "string" ? selected.fill : "#10b981"}
            onChange={(e) => setProp({ fill: e.target.value })}
            className="h-8 w-full cursor-pointer rounded border border-border bg-transparent"
            aria-label="Fill colour"
          />
        </Row>
      )}

      {image && adj && (
        <div className="space-y-3 rounded-lg border border-border p-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Adjustments</p>
          {([
            ["Brightness", "brightness", -1, 1, 0.01],
            ["Contrast", "contrast", -1, 1, 0.01],
            ["Saturation", "saturation", -1, 1, 0.01],
            ["Blur", "blur", 0, 1, 0.01],
          ] as const).map(([label, key, min, max, step]) => (
            <div key={key} className="space-y-1">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <Slider
                value={[adj[key]]}
                min={min}
                max={max}
                step={step}
                onValueChange={(v) => setAdj({ [key]: v[0] ?? 0 }, false)}
                onValueCommit={() => commit()}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <input type="checkbox" checked={adj.grayscale} onChange={(e) => setAdj({ grayscale: e.target.checked }, true)} />
            Black &amp; white
          </label>
        </div>
      )}
    </div>
  );
}
