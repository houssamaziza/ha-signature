"use client";

import { useMemo, useRef, useState } from "react";
import { APARTMENT_STATUSES, APARTMENT_TYPES, APARTMENT_VIEWS, STATUS_LABELS, TYPE_LABELS, VIEW_LABELS, floorLabel, type ApartmentStatus } from "@/shared/constants";
import { formatApartmentNumber, formatPriceDa } from "@/shared/format";
import type { MediaDTO } from "@/shared/types/admin";
import { api } from "./client-api";
import { Toggle } from "./Toggle";
import { Button, Card, Field, Notice, Pill, inputClass } from "./ui";
import { useSave } from "./useSave";

export type AdminApartmentRow = {
  id: number;
  number: number;
  type: (typeof APARTMENT_TYPES)[number];
  surfaceM2: number;
  floor: number;
  view: (typeof APARTMENT_VIEWS)[number];
  priceFromDa: number | null;
  priceOnRequest: boolean;
  status: ApartmentStatus;
  hasTerrace: boolean;
  isPublished: boolean;
  planMediaId: number | null;
  plan: { id: number; url: string; filename: string } | null;
  leadsCount: number;
};

const STATUS_TONE: Record<ApartmentStatus, "green" | "amber" | "gray"> = { AVAILABLE: "green", RESERVED: "amber", SOLD: "gray" };
const FLOORS = [-1, 0, 1, 2, 3, 4, 5, 6];

export function ApartmentsManager({ apartments }: { apartments: AdminApartmentRow[] }) {
  const [selectedId, setSelectedId] = useState(apartments[0]?.id ?? null);
  const [filter, setFilter] = useState<ApartmentStatus | "ALL">("ALL");
  const rows = useMemo(() => apartments.filter((a) => filter === "ALL" || a.status === filter), [apartments, filter]);
  const selected = apartments.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {(["ALL", ...APARTMENT_STATUSES] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} aria-pressed={filter === s}
            className={`h-9 rounded-full px-3.5 text-sm font-bold ${filter === s ? "bg-ink text-white" : "border border-card-line bg-white text-ink-soft"}`}>
            {s === "ALL" ? `Tous (${apartments.length})` : `${STATUS_LABELS[s]} (${apartments.filter((a) => a.status === s).length})`}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-x-auto rounded-md border border-card-line bg-white">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                {["Appt.", "Logement", "Étage", "Vue", "Prix", "Statut", "Plan", "Demandes"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => setSelectedId(a.id)} aria-selected={a.id === selectedId}
                  className={`cursor-pointer border-t border-card-line ${a.id === selectedId ? "bg-stone shadow-[inset_3px_0_0_var(--accent)]" : "hover:bg-paper"}`}>
                  <td className="px-3 py-3 font-bold">
                    <button type="button" className="font-bold" onClick={() => setSelectedId(a.id)} aria-label={`Modifier l’appartement ${formatApartmentNumber(a.number)}`}>
                      {formatApartmentNumber(a.number)}
                    </button>
                  </td>
                  <td className="px-3 py-3">{TYPE_LABELS[a.type]} · {a.surfaceM2} m²{!a.isPublished && <span className="ml-2 text-xs text-muted">(masqué)</span>}</td>
                  <td className="px-3 py-3">{floorLabel(a.floor)}</td>
                  <td className={`px-3 py-3 ${a.view === "SEA" ? "font-bold text-accent" : "text-muted"}`}>{VIEW_LABELS[a.view]}</td>
                  <td className="whitespace-nowrap px-3 py-3">{a.priceOnRequest || a.priceFromDa === null ? "Sur demande" : formatPriceDa(a.priceFromDa)}</td>
                  <td className="px-3 py-3"><Pill tone={STATUS_TONE[a.status]}>{STATUS_LABELS[a.status]}</Pill></td>
                  <td className="px-3 py-3">{a.plan ? "✓" : <span className="text-muted">À ajouter</span>}</td>
                  <td className="px-3 py-3">{a.leadsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && <ApartmentEditor key={selected.id + JSON.stringify(selected)} apartment={selected} />}
      </div>
    </div>
  );
}

function ApartmentEditor({ apartment }: { apartment: AdminApartmentRow }) {
  const [form, setForm] = useState(apartment);
  const { saving, notice, run, fieldError } = useSave();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof AdminApartmentRow>(k: K, v: AdminApartmentRow[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () =>
    run(() =>
      api(`/admin/apartments/${apartment.id}`, {
        method: "PATCH",
        json: {
          type: form.type, surfaceM2: form.surfaceM2, floor: form.floor, view: form.view,
          priceFromDa: form.priceFromDa, priceOnRequest: form.priceOnRequest, status: form.status,
          hasTerrace: form.hasTerrace, isPublished: form.isPublished,
        },
      }),
    );

  async function uploadPlan(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("category", "PLAN");
    fd.set("alt", `Plan de l’appartement ${formatApartmentNumber(apartment.number)}`);
    await run(async () => {
      const media = await api<MediaDTO>("/admin/media", { method: "POST", form: fd });
      return api(`/admin/apartments/${apartment.id}`, { method: "PATCH", json: { planMediaId: media.id } });
    }, "Plan ajouté : le lien « Voir le plan » est actif sur le site.");
    setUploading(false);
  }

  return (
    <Card title={`Appartement ${formatApartmentNumber(apartment.number)}`} subtitle={`${TYPE_LABELS[form.type]} · ${form.surfaceM2} m² · ${floorLabel(form.floor)}`} className="xl:sticky xl:top-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value as AdminApartmentRow["type"])}>
            {APARTMENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </Field>
        <Field label="Surface (m²)" error={fieldError("surfaceM2")}>
          <input className={inputClass} type="number" min={10} value={form.surfaceM2} onChange={(e) => set("surfaceM2", Number(e.target.value))} />
        </Field>
        <Field label="Étage">
          <select className={inputClass} value={form.floor} onChange={(e) => set("floor", Number(e.target.value))}>
            {FLOORS.map((f) => <option key={f} value={f}>{floorLabel(f)}</option>)}
          </select>
        </Field>
        <Field label="Vue">
          <select className={inputClass} value={form.view} onChange={(e) => set("view", e.target.value as AdminApartmentRow["view"])}>
            {APARTMENT_VIEWS.map((v) => <option key={v} value={v}>{VIEW_LABELS[v]}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Prix « à partir de » (DA)" error={fieldError("priceFromDa")}>
        <input className={inputClass} type="number" min={0} step={100000} disabled={form.priceOnRequest}
          value={form.priceFromDa ?? ""} onChange={(e) => set("priceFromDa", e.target.value === "" ? null : Number(e.target.value))} />
      </Field>
      <Toggle label="Afficher « Prix sur demande »" checked={form.priceOnRequest} onChange={(v) => set("priceOnRequest", v)} />
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-ink-soft">Statut</span>
        <div role="radiogroup" className="flex overflow-hidden rounded border border-[#b9b1a3]">
          {APARTMENT_STATUSES.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={form.status === s} onClick={() => set("status", s)}
              className={`h-10 flex-1 text-sm font-bold ${form.status === s ? "bg-[#24563a] text-white" : "text-ink-soft"}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
      <Toggle label="Terrasse" checked={form.hasTerrace} onChange={(v) => set("hasTerrace", v)} />
      <Toggle label="Afficher ce logement sur le site" checked={form.isPublished} onChange={(v) => set("isPublished", v)} />

      <div className="flex flex-col gap-2 rounded border border-dashed border-[#b9b1a3] bg-paper p-4">
        <span className="text-[13px] font-bold text-ink-soft">Plan de l’appartement</span>
        {apartment.plan ? (
          <span className="text-sm">
            <a href={apartment.plan.url} target="_blank" rel="noopener noreferrer">{apartment.plan.filename}</a>
          </span>
        ) : (
          <span className="text-sm text-muted">Aucun plan : le site affiche « Plan bientôt disponible ».</span>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? "Envoi…" : apartment.plan ? "Remplacer le plan" : "Ajouter le plan"}</Button>
          {apartment.plan && (
            <Button size="sm" variant="danger" onClick={() => run(() => api(`/admin/apartments/${apartment.id}`, { method: "PATCH", json: { planMediaId: null } }), "Plan retiré.")}>Retirer</Button>
          )}
        </div>
        <span className="text-xs text-muted">PDF, JPG ou PNG · 10 Mo maximum</span>
        <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && uploadPlan(e.target.files[0])} />
      </div>

      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <div className="flex justify-end gap-2">
        <Button onClick={() => setForm(apartment)}>Annuler</Button>
        <Button variant="primary" disabled={saving} onClick={save}>{saving ? "Publication…" : "Enregistrer"}</Button>
      </div>
    </Card>
  );
}
