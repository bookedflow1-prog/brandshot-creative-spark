import * as fabric from "fabric";

/** Extra properties we persist alongside the standard Fabric JSON. */
export const CUSTOM_PROPS = ["lvId", "lvName", "lvRole"] as const;

export type LvObject = fabric.FabricObject & {
  lvId?: string;
  lvName?: string;
  lvRole?: "background" | undefined;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const ASPECT_RATIOS = [
  { label: "1:1", w: 1080, h: 1080, hint: "Instagram post" },
  { label: "4:5", w: 1080, h: 1350, hint: "Instagram feed" },
  { label: "9:16", w: 1080, h: 1920, hint: "Reels / TikTok" },
  { label: "16:9", w: 1920, h: 1080, hint: "YouTube / web" },
  { label: "3:2", w: 1620, h: 1080, hint: "Print / product" },
] as const;

export const FONTS = [
  "Inter",
  "Instrument Serif",
  "Georgia",
  "Times New Roman",
  "Helvetica",
  "Arial",
  "Courier New",
  "Verdana",
] as const;

export const TEXT_PRESETS = {
  heading: { fontSize: 96, fontWeight: "700", lvName: "Heading" },
  subheading: { fontSize: 56, fontWeight: "600", lvName: "Subheading" },
  body: { fontSize: 32, fontWeight: "400", lvName: "Body text" },
} as const;

export function labelFor(o: LvObject): string {
  if (o.lvName) return o.lvName;
  switch (o.type) {
    case "i-text":
    case "textbox":
      return ((o as fabric.IText).text ?? "Text").slice(0, 24) || "Text";
    case "image":
      return "Image";
    case "rect":
      return "Rectangle";
    case "circle":
      return "Circle";
    case "line":
      return "Line";
    default:
      return o.type ?? "Layer";
  }
}

export const isTextObject = (o: fabric.FabricObject | null | undefined) =>
  !!o && (o.type === "i-text" || o.type === "text" || o.type === "textbox");

export const isImageObject = (o: fabric.FabricObject | null | undefined) => !!o && o.type === "image";

/* ---------------- image filters ---------------- */

export type Adjustments = {
  brightness: number; // -1..1
  contrast: number; // -1..1
  saturation: number; // -1..1
  blur: number; // 0..1
  grayscale: boolean;
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: false,
};

export function readAdjustments(img: fabric.FabricImage): Adjustments {
  const a = { ...DEFAULT_ADJUSTMENTS };
  for (const f of img.filters ?? []) {
    const t = (f as { type?: string }).type;
    if (t === "Brightness") a.brightness = (f as fabric.filters.Brightness).brightness;
    else if (t === "Contrast") a.contrast = (f as fabric.filters.Contrast).contrast;
    else if (t === "Saturation") a.saturation = (f as fabric.filters.Saturation).saturation;
    else if (t === "Blur") a.blur = (f as fabric.filters.Blur).blur;
    else if (t === "Grayscale") a.grayscale = true;
  }
  return a;
}

export function applyAdjustments(img: fabric.FabricImage, a: Adjustments) {
  const filters: fabric.filters.BaseFilter<string>[] = [];
  if (a.brightness !== 0) filters.push(new fabric.filters.Brightness({ brightness: a.brightness }));
  if (a.contrast !== 0) filters.push(new fabric.filters.Contrast({ contrast: a.contrast }));
  if (a.saturation !== 0) filters.push(new fabric.filters.Saturation({ saturation: a.saturation }));
  if (a.blur > 0) filters.push(new fabric.filters.Blur({ blur: a.blur }));
  if (a.grayscale) filters.push(new fabric.filters.Grayscale());
  img.filters = filters;
  img.applyFilters();
}

/* ---------------- alignment ---------------- */

export type AlignKind = "left" | "center-h" | "right" | "top" | "center-v" | "bottom";

export function alignObject(obj: fabric.FabricObject, kind: AlignKind, artboard: { w: number; h: number }) {
  const b = obj.getBoundingRect();
  const dx = { left: -b.left, "center-h": artboard.w / 2 - (b.left + b.width / 2), right: artboard.w - (b.left + b.width) };
  const dy = { top: -b.top, "center-v": artboard.h / 2 - (b.top + b.height / 2), bottom: artboard.h - (b.top + b.height) };
  if (kind in dx) obj.set({ left: (obj.left ?? 0) + dx[kind as keyof typeof dx] });
  if (kind in dy) obj.set({ top: (obj.top ?? 0) + dy[kind as keyof typeof dy] });
  obj.setCoords();
}
