import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "user-media";

export type AssetRow = {
  id: string;
  project_id: string | null;
  user_id: string;
  kind: "audio" | "design" | "export" | "generated" | "original" | "video";
  storage_path: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  name: string | null;
  favorite: boolean;
  source: string;
  size_bytes: number | null;
  duration_seconds: number | null;
  created_at: string;
};

function extOf(file: File) {
  const fromName = file.name.includes(".") ? file.name.split(".").pop()! : "";
  if (fromName) return fromName.toLowerCase();
  return (file.type.split("/")[1] ?? "bin").toLowerCase();
}

export function kindForMime(mime: string): AssetKind {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "original";
}

async function readImageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return { width: null, height: null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Uploads a file to the private bucket under the owner's folder and records it in the asset library. */
export type AssetKind = AssetRow["kind"] & ("audio" | "design" | "export" | "generated" | "original" | "video");

export async function uploadAsset(file: File, opts: { projectId?: string | null; kind?: AssetKind } = {}) {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  if (!userId) throw new Error("Not signed in");

  const path = `${userId}/library/${crypto.randomUUID()}.${extOf(file)}`;
  const { error: upErr } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (upErr) throw upErr;

  const { width, height } = await readImageSize(file);
  const { data, error } = await supabase
    .from("project_assets")
    .insert({
      user_id: userId,
      project_id: opts.projectId ?? null,
      kind: opts.kind ?? kindForMime(file.type || "image/png"),
      storage_path: path,
      mime_type: file.type || null,
      width,
      height,
      name: file.name,
      source: "upload",
      size_bytes: file.size,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as AssetRow;
}

const urlCache = new Map<string, { url: string; expires: number }>();

/** Signed URL for a private asset (cached until shortly before expiry). */
export async function signedUrl(path: string, expiresIn = 3600): Promise<string> {
  const hit = urlCache.get(path);
  if (hit && hit.expires > Date.now() + 60_000) return hit.url;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not sign URL");
  urlCache.set(path, { url: data.signedUrl, expires: Date.now() + expiresIn * 1000 });
  return data.signedUrl;
}

export async function deleteAsset(asset: Pick<AssetRow, "id" | "storage_path">) {
  await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
  const { error } = await supabase.from("project_assets").delete().eq("id", asset.id);
  if (error) throw error;
  urlCache.delete(asset.storage_path);
}

export async function toggleFavorite(id: string, favorite: boolean) {
  const { error } = await supabase.from("project_assets").update({ favorite }).eq("id", id);
  if (error) throw error;
}

export async function downloadAsset(asset: Pick<AssetRow, "storage_path" | "name">) {
  const url = await signedUrl(asset.storage_path);
  const res = await fetch(url);
  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objUrl;
  a.download = asset.name ?? asset.storage_path.split("/").pop() ?? "brandshot-asset";
  a.click();
  setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
}
