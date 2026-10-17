"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { MediaDTO } from "@/shared/types/admin";
import { api } from "./client-api";
import { Button, Card, Field, Notice, inputClass, textareaClass } from "./ui";
import { useSave } from "./useSave";

type Phase = { order: number; name: string };
type Photo = { id: number; takenAt: string; caption: string; url: string; alt: string };
type Props = {
  currentPhaseOrder: number;
  deliveryLabel: string;
  features: string[];
  phases: Phase[];
  photos: Photo[];
};

const today = () => new Date().toISOString().slice(0, 10);

export function ProgressManager({ currentPhaseOrder, deliveryLabel, features, phases, photos }: Props) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <PhaseCard current={currentPhaseOrder} phases={phases} />
        <ProjectInfoCard deliveryLabel={deliveryLabel} features={features} />
      </div>
      <PhotosCard photos={photos} />
    </div>
  );
}

function PhaseCard({ current, phases }: { current: number; phases: Phase[] }) {
  const [value, setValue] = useState(current);
  const { saving, notice, run } = useSave();
  return (
    <Card title="Étape en cours" subtitle="Les étapes précédentes s’affichent « Terminé » sur le site.">
      <div role="radiogroup" aria-label="Étape en cours" className="flex flex-col gap-2">
        {phases.map((p) => {
          const on = p.order === value;
          return (
            <button key={p.order} type="button" role="radio" aria-checked={on} onClick={() => setValue(p.order)}
              className={`flex min-h-12 items-center gap-3 rounded border px-3.5 text-left text-[15px] ${on ? "border-accent bg-stone font-bold" : "border-card-line bg-white"}`}>
              <span className={`h-[18px] w-[18px] shrink-0 rounded-full border-2 ${on ? "border-[6px] border-accent" : "border-[#b9b1a3]"}`} />
              <span className="flex-1">{p.name}</span>
              <span className="text-[13px] font-medium text-muted">{p.order < value ? "Terminé" : on ? "En cours" : "À venir"}</span>
            </button>
          );
        })}
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button variant="primary" disabled={saving || value === current} onClick={() => run(() => api("/admin/project", { method: "PATCH", json: { currentPhaseOrder: value } }))}>
        {saving ? "Publication…" : "Publier l’étape"}
      </Button>
    </Card>
  );
}

function ProjectInfoCard({ deliveryLabel, features }: { deliveryLabel: string; features: string[] }) {
  const [delivery, setDelivery] = useState(deliveryLabel);
  const [featuresText, setFeaturesText] = useState(features.join("\n"));
  const { saving, notice, run, fieldError } = useSave();
  return (
    <Card title="Informations du programme">
      <Field label="Livraison prévue" hint="Ex. janvier 2028" error={fieldError("deliveryLabel")}>
        <input className={inputClass} value={delivery} onChange={(e) => setDelivery(e.target.value)} />
      </Field>
      <Field label="Atouts de la résidence" hint="Un atout par ligne (10 maximum)." error={fieldError("features")}>
        <textarea className={textareaClass} rows={6} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
      </Field>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button variant="primary" disabled={saving} onClick={() => run(() => api("/admin/project", {
        method: "PATCH",
        json: { deliveryLabel: delivery, features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean) },
      }))}>
        {saving ? "Publication…" : "Enregistrer"}
      </Button>
    </Card>
  );
}

function PhotosCard({ photos }: { photos: Photo[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState(today());
  const [caption, setCaption] = useState("");
  const { saving, notice, run } = useSave();

  async function add() {
    if (!file) return;
    const ok = await run(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("category", "CONSTRUCTION");
      fd.set("alt", caption);
      const media = await api<MediaDTO>("/admin/media", { method: "POST", form: fd });
      return api("/admin/project/photos", { method: "POST", json: { mediaId: media.id, takenAt: date, caption } });
    }, "Photo publiée sur la page Avancement.");
    if (ok) {
      setFile(null);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card title="Photos du chantier" subtitle="Les plus récentes s’affichent en premier sur le site.">
      <div className="grid gap-3 rounded border-2 border-dashed border-[#b9b1a3] bg-paper p-4 md:grid-cols-[1fr_160px] md:items-end">
        <div className="md:col-span-2">
          <Field label="Photo (JPG, PNG ou WebP · 10 Mo max.)">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
        </div>
        <Field label="Légende"><input className={inputClass} value={caption} maxLength={200} placeholder="Ex. coulage des fondations" onChange={(e) => setCaption(e.target.value)} /></Field>
        <Field label="Date de la photo"><input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <div className="md:col-span-2">
          <Button variant="primary" disabled={!file || !caption.trim() || saving} onClick={add}>{saving ? "Envoi…" : "+ Ajouter la photo"}</Button>
        </div>
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {photos.length === 0 && <p className="text-muted">Aucune photo pour le moment.</p>}
      {photos.map((p) => <PhotoRow key={`${p.id}-${p.caption}-${p.takenAt}`} photo={p} />)}
    </Card>
  );
}

function PhotoRow({ photo }: { photo: Photo }) {
  const [caption, setCaption] = useState(photo.caption);
  const [date, setDate] = useState(photo.takenAt.slice(0, 10));
  const { saving, notice, run } = useSave();
  return (
    <div className="flex flex-col gap-3 rounded border border-card-line p-3.5 md:flex-row md:items-end">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded bg-photo md:w-36">
        <Image src={photo.url} alt={photo.alt} fill sizes="144px" className="object-cover" />
      </div>
      <div className="grid flex-1 gap-3 md:grid-cols-[150px_1fr]">
        <Field label="Date"><input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Légende"><input className={inputClass} value={caption} maxLength={200} onChange={(e) => setCaption(e.target.value)} /></Field>
        {notice && <div className="md:col-span-2"><Notice tone={notice.tone}>{notice.text}</Notice></div>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={saving} onClick={() => run(() => api(`/admin/progress-photos/${photo.id}`, { method: "PATCH", json: { caption, takenAt: date } }))}>Enregistrer</Button>
        <Button size="sm" variant="danger" disabled={saving} onClick={() => confirm("Supprimer cette photo du site ?") && run(() => api(`/admin/progress-photos/${photo.id}`, { method: "DELETE" }), "Photo supprimée.")}>Supprimer</Button>
      </div>
    </div>
  );
}
