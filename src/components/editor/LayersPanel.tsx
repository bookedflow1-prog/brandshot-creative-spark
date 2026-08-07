import { useState } from "react";
import type * as fabric from "fabric";
import { Eye, EyeOff, GripVertical, Lock, Unlock, Trash2, Copy, Image as ImageIcon, Type as TypeIcon, Square } from "lucide-react";
import { labelFor, type LvObject } from "./editor-utils";

type Props = {
  layers: LvObject[]; // top-most first
  selectedIds: string[];
  onSelect: (o: LvObject, additive: boolean) => void;
  onToggleVisible: (o: LvObject) => void;
  onToggleLock: (o: LvObject) => void;
  onDelete: (o: LvObject) => void;
  onDuplicate: (o: LvObject) => void;
  onReorder: (from: number, to: number) => void;
  onRename: (o: LvObject, name: string) => void;
};

function iconFor(o: fabric.FabricObject) {
  if (o.type === "image") return <ImageIcon className="h-3.5 w-3.5" />;
  if (o.type === "i-text" || o.type === "textbox") return <TypeIcon className="h-3.5 w-3.5" />;
  return <Square className="h-3.5 w-3.5" />;
}

export function LayersPanel({
  layers, selectedIds, onSelect, onToggleVisible, onToggleLock, onDelete, onDuplicate, onReorder, onRename,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <p className="px-3 pb-2 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Layers</p>
      <div className="flex-1 space-y-0.5 overflow-auto px-2 pb-2">
        {layers.length === 0 && (
          <p className="px-2 py-6 text-xs text-muted-foreground">Nothing here yet. Add an image, text or a shape.</p>
        )}
        {layers.map((o, i) => {
          const active = selectedIds.includes(o.lvId ?? "");
          const locked = !!o.lockMovementX;
          return (
            <div
              key={o.lvId ?? i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
                setDragIndex(null); setOverIndex(null);
              }}
              onClick={(e) => onSelect(o, e.shiftKey)}
              className={`group flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition
                ${active ? "bg-primary/10 text-primary" : "hover:bg-muted"}
                ${overIndex === i && dragIndex !== null && dragIndex !== i ? "ring-1 ring-primary/50" : ""}
                ${dragIndex === i ? "opacity-50" : ""}`}
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <span className="shrink-0">{iconFor(o)}</span>
              {editing === o.lvId ? (
                <input
                  autoFocus
                  defaultValue={labelFor(o)}
                  onBlur={(e) => { onRename(o, e.target.value.trim() || labelFor(o)); setEditing(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditing(null); }}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-1 py-0.5 text-xs outline-none"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate" onDoubleClick={() => setEditing(o.lvId ?? null)}>
                  {labelFor(o)}
                </span>
              )}
              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button aria-label="Duplicate layer" className="rounded p-1 hover:bg-background" onClick={(e) => { e.stopPropagation(); onDuplicate(o); }}>
                  <Copy className="h-3 w-3" />
                </button>
                <button aria-label="Delete layer" className="rounded p-1 text-destructive hover:bg-background" onClick={(e) => { e.stopPropagation(); onDelete(o); }}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
              <button aria-label="Toggle lock" className={`shrink-0 rounded p-1 hover:bg-background ${locked ? "" : "opacity-0 group-hover:opacity-100"}`} onClick={(e) => { e.stopPropagation(); onToggleLock(o); }}>
                {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </button>
              <button aria-label="Toggle visibility" className="shrink-0 rounded p-1 hover:bg-background" onClick={(e) => { e.stopPropagation(); onToggleVisible(o); }}>
                {o.visible === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
