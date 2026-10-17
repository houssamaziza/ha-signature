"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { MediaDTO } from "@/shared/types/admin";
import { ApiClientError, api } from "./client-api";
import { Button } from "./ui";

type Props = {
  media: MediaDTO[];
  value: string | null; // url sélectionnée
  onChange: (m: MediaDTO) => void;
  category?: MediaDTO["category"];
  accept?: string;
};

/** Choix d'une image dans la médiathèque, ou envoi d'une nouvelle. */
export function MediaPicker({ media, value, onChange, category = "OTHER", accept = "image/jpeg,image/png,image/webp" }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(media);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const images = items.filter((m) => m.mimeType.startsWith("image/"));

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("category", category);
      const created = await api<MediaDTO>("/admin/media", { method: "POST", form });
      const withUsage = { ...created, usage: [] };
      setItems((prev) => [withUsage, ...prev]);
      onChange(withUsage);
      setOpen(false);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Envoi impossible.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? "Envoi…" : "Envoyer une photo"}</Button>
        <Button size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>Choisir dans les médias</Button>
        <input ref={fileRef} type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
      {error && <p className="text-sm font-bold text-[#a1361b]">{error}</p>}
      {open && (
        <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto rounded border border-card-line p-2 sm:grid-cols-4">
          {images.map((m) => (
            <button key={m.id} type="button" onClick={() => { onChange(m); setOpen(false); }}
              className={`relative h-24 overflow-hidden rounded border-2 ${m.url === value ? "border-accent" : "border-transparent"}`}>
              <Image src={m.url} alt={m.alt} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
