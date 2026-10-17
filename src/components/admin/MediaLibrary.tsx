"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { MEDIA_CATEGORIES } from "@/shared/schemas/admin";
import type { MediaDTO } from "@/shared/types/admin";
import { api } from "./client-api";
import { Button, Card, Field, Notice, inputClass } from "./ui";
import { useSave } from "./useSave";

const CATEGORY_LABELS: Record<MediaDTO["category"], string> = {
  FACADE: "Façades", INTERIOR: "Intérieurs", CONSTRUCTION: "Chantier", PLAN: "Plans", LOGO: "Logo", OTHER: "Autres",
};

const sizeLabel = (b: number) => (b > 1_000_000 ? `${(b / 1_000_000).toFixed(1).replace(".", ",")} Mo` : `${Math.round(b / 1000)} Ko`);

export function MediaLibrary({ media }: { media: MediaDTO[] }) {
  const [category, setCategory] = useState<MediaDTO["category"] | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState(media[0]?.id ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useSave();
  const items = media.filter((m) => category === "ALL" || m.category === category);
  const selected = media.find((m) => m.id === selectedId) ?? null;

  async function onFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("category", category === "ALL" ? "OTHER" : category);
      await upload.run(() => api("/admin/media", { method: "POST", form: fd }), "Fichier(s) importé(s).");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...MEDIA_CATEGORIES] as const).map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
              className={`h-9 rounded-full px-3.5 text-sm font-bold ${category === c ? "bg-ink text-white" : "border border-card-line bg-white text-ink-soft"}`}>
              {c === "ALL" ? `Tous (${media.length})` : `${CATEGORY_LABELS[c]} (${media.filter((m) => m.category === c).length})`}
            </button>
          ))}
        </div>
        <Button variant="primary" disabled={upload.saving} onClick={() => fileRef.current?.click()}>{upload.saving ? "Envoi…" : "+ Importer"}</Button>
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
      </div>
      {upload.notice && <Notice tone={upload.notice.tone}>{upload.notice.text}</Notice>}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {items.map((m) => (
            <button key={m.id} type="button" onClick={() => setSelectedId(m.id)} aria-pressed={m.id === selectedId}
              className={`flex flex-col gap-1.5 rounded-md border-2 bg-white p-2 text-left ${m.id === selectedId ? "border-accent" : "border-card-line"}`}>
              <div className="relative h-36 overflow-hidden rounded bg-photo">
                {m.mimeType.startsWith("image/") ? <Image src={m.url} alt={m.alt} fill sizes="240px" className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">PDF</span>}
              </div>
              <span className="truncate text-sm font-bold">{m.filename}</span>
              <span className="truncate text-xs text-muted">{m.usage[0] ?? "Non utilisé"}</span>
            </button>
          ))}
        </div>
        {selected && <MediaDetails key={selected.id + selected.alt + selected.category} media={selected} onDeleted={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}

function MediaDetails({ media, onDeleted }: { media: MediaDTO; onDeleted: () => void }) {
  const [alt, setAlt] = useState(media.alt);
  const [category, setCategory] = useState(media.category);
  const { saving, notice, run } = useSave();
  return (
    <Card title="Détails" className="xl:sticky xl:top-6">
      <div className="relative h-56 overflow-hidden rounded bg-photo">
        {media.mimeType.startsWith("image/") ? <Image src={media.url} alt={media.alt} fill sizes="340px" className="object-cover" /> : (
          <a href={media.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center font-bold">Ouvrir le PDF</a>
        )}
      </div>
      <div className="text-sm"><strong className="block break-all">{media.filename}</strong><span className="text-muted">{sizeLabel(media.sizeBytes)}</span></div>
      <Field label="Texte alternatif" hint="Décrit l’image pour Google et l’accessibilité."><textarea className={`${inputClass} h-auto py-2`} rows={3} value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} /></Field>
      <Field label="Catégorie">
        <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as MediaDTO["category"])}>
          {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </Field>
      <div className="text-sm"><span className="mb-1 block text-[13px] font-bold text-ink-soft">Utilisé sur</span>{media.usage.length ? media.usage.join(" · ") : "Nulle part"}</div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <div className="flex gap-2">
        <Button variant="primary" disabled={saving} onClick={() => run(() => api(`/admin/media/${media.id}`, { method: "PATCH", json: { alt, category } }))}>Enregistrer</Button>
        <Button variant="danger" disabled={saving} onClick={async () => {
          if (!confirm("Supprimer définitivement ce fichier ?")) return;
          const ok = await run(() => api(`/admin/media/${media.id}`, { method: "DELETE" }), "Fichier supprimé.");
          if (ok) onDeleted();
        }}>Supprimer</Button>
      </div>
    </Card>
  );
}
