import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError } from "../http/response";

/**
 * Stockage des fichiers envoyés depuis l'administration (photos, plans)
 * dans Cloudflare KV (binding `MEDIA`, voir wrangler.jsonc). 25 Mo max par
 * valeur côté KV ; on limite à 10 Mo. Les fichiers sont servis par /media/[file].
 * Pour de gros volumes, passer à R2 en gardant la même interface.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const startsWith = (b: Uint8Array, bytes: number[]) => bytes.every((v, i) => b[i] === v);
const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to));

export const ALLOWED_TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  "image/png": { ext: "png", magic: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  "image/webp": { ext: "webp", magic: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
  "application/pdf": { ext: "pdf", magic: (b) => ascii(b, 0, 5) === "%PDF-" },
};

const SAFE_NAME = /^[a-z0-9-]+\.(jpg|png|webp|pdf)$/;

function bucket(): KVNamespace {
  return getCloudflareContext().env.MEDIA;
}

function randomHex(bytes: number): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function safeBaseName(filename: string): string {
  const name = filename.replace(/\.[^.]*$/, "");
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "fichier"
  );
}

export async function saveUpload(file: File): Promise<{ url: string; filename: string; mimeType: string; sizeBytes: number }> {
  const type = ALLOWED_TYPES[file.type];
  if (!type) throw new AppError(415, "UNSUPPORTED_TYPE", "Format accepté : JPG, PNG, WebP ou PDF.");
  if (file.size > MAX_UPLOAD_BYTES) throw new AppError(413, "FILE_TOO_LARGE", "Fichier trop lourd (10 Mo maximum).");

  const data = await file.arrayBuffer();
  if (!type.magic(new Uint8Array(data))) throw new AppError(415, "INVALID_FILE", "Le contenu du fichier ne correspond pas à son format.");

  const stored = `${safeBaseName(file.name)}-${randomHex(4)}.${type.ext}`;
  await bucket().put(`media/${stored}`, data, { metadata: { contentType: file.type } });
  return { url: `/media/${stored}`, filename: file.name.slice(0, 200), mimeType: file.type, sizeBytes: file.size };
}

/** Lit un fichier stocké ; null si le nom est invalide ou absent. */
export async function readUpload(name: string): Promise<{ data: ArrayBuffer; mimeType: string } | null> {
  if (!SAFE_NAME.test(name)) return null;
  const { value, metadata } = await bucket().getWithMetadata<{ contentType?: string }>(`media/${name}`, { type: "arrayBuffer", cacheTtl: 3600 });
  if (!value) return null;
  const ext = name.split(".").pop();
  const mimeType = metadata?.contentType ?? Object.entries(ALLOWED_TYPES).find(([, t]) => t.ext === ext)?.[0] ?? "application/octet-stream";
  return { data: value, mimeType };
}

export async function deleteUpload(url: string) {
  const name = url.startsWith("/media/") ? url.slice("/media/".length) : null;
  if (!name || !SAFE_NAME.test(name)) return; // images d'origine (/images/…) : non supprimées
  await bucket().delete(`media/${name}`);
}
