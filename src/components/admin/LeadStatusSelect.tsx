"use client";

import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/shared/constants";
import { api } from "./client-api";
import { useSave } from "./useSave";

export function LeadStatusSelect({ id, status }: { id: number; status: LeadStatus }) {
  const { saving, notice, run } = useSave();
  return (
    <span className="flex flex-col gap-1">
      <select
        aria-label="Statut de la demande"
        defaultValue={status}
        disabled={saving}
        onChange={(e) => run(() => api(`/admin/leads/${id}`, { method: "PATCH", json: { status: e.target.value } }), "Statut mis à jour.")}
        className="h-9 rounded border border-[#b9b1a3] bg-white px-2 text-sm font-bold"
      >
        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
      </select>
      {notice?.tone === "error" && <span className="text-xs font-bold text-[#a1361b]">{notice.text}</span>}
    </span>
  );
}
