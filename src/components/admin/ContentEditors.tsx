"use client";

import Image from "next/image";
import { useState } from "react";
import type { HeroBlock, StepsBlock } from "@/shared/schemas/content";
import type { MediaDTO } from "@/shared/types/admin";
import { api } from "./client-api";
import { MediaPicker } from "./MediaPicker";
import { Toggle } from "./Toggle";
import { Button, Card, Field, Notice, inputClass, textareaClass } from "./ui";
import { useSave } from "./useSave";

const LINK_OPTIONS = [
  { value: "/appartements", label: "Page : Nos appartements" },
  { value: "/avancement", label: "Page : Avancement" },
  { value: "/contact", label: "Page : Contact" },
  { value: "/", label: "Page : Accueil" },
];

const VARIANTS = [
  { value: "primary", label: "Principal (foncé)" },
  { value: "secondary", label: "Secondaire (contour)" },
  { value: "accent", label: "Couleur d’accent" },
] as const;

export function HeroEditor({ initial, visible, media }: { initial: HeroBlock; visible: boolean; media: MediaDTO[] }) {
  const [data, setData] = useState(initial);
  const [isVisible, setVisible] = useState(visible);
  const { saving, notice, run } = useSave();
  const set = <K extends keyof HeroBlock>(k: K, v: HeroBlock[K]) => setData((d) => ({ ...d, [k]: v }));
  const setButton = (i: number, patch: Partial<HeroBlock["buttons"][number]>) =>
    set("buttons", data.buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  return (
    <Card
      title="Accueil — haut de page"
      subtitle="Le premier bloc que voient les visiteurs"
      actions={<div className="w-56"><Toggle label="Afficher la section" checked={isVisible} onChange={setVisible} /></div>}
    >
      <Field label="Petit titre"><input className={inputClass} value={data.eyebrow} maxLength={80} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
      <Field label="Titre principal"><textarea className={textareaClass} rows={2} value={data.title} maxLength={160} onChange={(e) => set("title", e.target.value)} /></Field>
      <Field label="Texte"><textarea className={textareaClass} rows={3} value={data.text} maxLength={600} onChange={(e) => set("text", e.target.value)} /></Field>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold text-ink-soft">Boutons</span>
        {data.buttons.map((b, i) => {
          const custom = !LINK_OPTIONS.some((o) => o.value === b.href);
          return (
            <div key={i} className="grid gap-3 rounded border border-card-line bg-paper p-3.5 md:grid-cols-2">
              <div className="md:col-span-2"><Field label={`Bouton ${i + 1} — texte`}><input className={inputClass} value={b.label} maxLength={60} onChange={(e) => setButton(i, { label: e.target.value })} /></Field></div>
              <Field label="Lien vers">
                <select className={inputClass} value={custom ? "__custom" : b.href} onChange={(e) => setButton(i, { href: e.target.value === "__custom" ? "https://" : e.target.value })}>
                  {LINK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value="__custom">Autre lien (téléphone, WhatsApp, site externe…)</option>
                </select>
              </Field>
              <Field label="Style">
                <select className={inputClass} value={b.variant} onChange={(e) => setButton(i, { variant: e.target.value as (typeof VARIANTS)[number]["value"] })}>
                  {VARIANTS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </Field>
              {custom && (
                <div className="md:col-span-2"><Field label="Adresse du lien" hint="Ex. tel:+213550333769, https://wa.me/213550333769"><input className={inputClass} value={b.href} onChange={(e) => setButton(i, { href: e.target.value })} /></Field></div>
              )}
              <div className="md:col-span-2"><Button size="sm" variant="danger" onClick={() => set("buttons", data.buttons.filter((_, j) => j !== i))}>Retirer ce bouton</Button></div>
            </div>
          );
        })}
        {data.buttons.length < 3 && (
          <Button size="sm" className="self-start border-dashed" onClick={() => set("buttons", [...data.buttons, { label: "Nouveau bouton", href: "/contact", variant: "secondary" }])}>
            + Ajouter un bouton
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold text-ink-soft">Photo</span>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <div className="relative h-52 overflow-hidden rounded bg-photo">{data.imageUrl && <Image src={data.imageUrl} alt="" fill sizes="180px" className="object-cover" />}</div>
          <div className="flex flex-col gap-3">
            <MediaPicker media={media} value={data.imageUrl} category="FACADE" onChange={(m) => setData((d) => ({ ...d, imageUrl: m.url, imageAlt: m.alt || d.imageAlt }))} />
            <Field label="Texte alternatif" hint="Décrit la photo pour Google et les personnes malvoyantes."><input className={inputClass} value={data.imageAlt} maxLength={200} onChange={(e) => set("imageAlt", e.target.value)} /></Field>
          </div>
        </div>
      </div>

      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button variant="primary" className="self-end" disabled={saving}
        onClick={() => run(() => api("/admin/content/home.hero", { method: "PUT", json: { data, isVisible } }))}>
        {saving ? "Publication…" : "Publier sur le site"}
      </Button>
    </Card>
  );
}

export function StepsEditor({ initial, visible }: { initial: StepsBlock; visible: boolean }) {
  const [data, setData] = useState(initial);
  const [isVisible, setVisible] = useState(visible);
  const { saving, notice, run } = useSave();
  const setStep = (i: number, patch: Partial<StepsBlock["steps"][number]>) =>
    setData((d) => ({ ...d, steps: d.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  return (
    <Card title="Accueil — les étapes d’achat" subtitle="Bloc foncé « Un seul interlocuteur… »"
      actions={<div className="w-56"><Toggle label="Afficher la section" checked={isVisible} onChange={setVisible} /></div>}>
      <Field label="Titre"><textarea className={textareaClass} rows={2} value={data.title} maxLength={160} onChange={(e) => setData({ ...data, title: e.target.value })} /></Field>
      <Field label="Texte"><textarea className={textareaClass} rows={2} value={data.text} maxLength={400} onChange={(e) => setData({ ...data, text: e.target.value })} /></Field>
      {data.steps.map((s, i) => (
        <div key={i} className="grid gap-3 rounded border border-card-line bg-paper p-3.5 md:grid-cols-[200px_1fr_auto] md:items-end">
          <Field label={`Étape ${i + 1}`}><input className={inputClass} value={s.title} maxLength={60} onChange={(e) => setStep(i, { title: e.target.value })} /></Field>
          <Field label="Description"><input className={inputClass} value={s.text} maxLength={240} onChange={(e) => setStep(i, { text: e.target.value })} /></Field>
          <Button size="sm" variant="danger" onClick={() => setData({ ...data, steps: data.steps.filter((_, j) => j !== i) })}>Retirer</Button>
        </div>
      ))}
      {data.steps.length < 6 && (
        <Button size="sm" className="self-start border-dashed" onClick={() => setData({ ...data, steps: [...data.steps, { title: "Nouvelle étape", text: "" }] })}>+ Ajouter une étape</Button>
      )}
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button variant="primary" className="self-end" disabled={saving}
        onClick={() => run(() => api("/admin/content/home.steps", { method: "PUT", json: { data, isVisible } }))}>
        {saving ? "Publication…" : "Publier sur le site"}
      </Button>
    </Card>
  );
}
