import Link from "next/link";
import { PlanIcon } from "@/components/ui/icons";
import { STATUS_LABELS, TYPE_LABELS, VIEW_LABELS, floorLabel } from "@/shared/constants";
import { formatApartmentNumber, formatPriceDa } from "@/shared/format";
import type { ApartmentDTO } from "@/shared/types/api";

export function ApartmentCard({ apartment: a }: { apartment: ApartmentDTO }) {
  const num = formatApartmentNumber(a.number);
  const sea = a.view === "SEA";
  const unavailable = a.status !== "AVAILABLE";
  return (
    <article className="flex flex-col gap-3 border border-card-line bg-paper p-4 md:gap-3.5 md:p-7">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl font-semibold md:text-[30px]">{TYPE_LABELS[a.type]}</h3>
        <span className="text-[11px] font-bold tracking-[0.1em] text-muted md:text-[13px]">APPT. {num}</span>
      </div>
      <span className="text-lg font-medium md:text-[22px]">
        {a.surfaceM2} m² · {floorLabel(a.floor)}
      </span>
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-[2px] px-2.5 py-1.5 text-xs font-bold md:text-[13px] ${sea ? "bg-accent text-white" : "bg-sand text-ink-soft"}`}>
          {VIEW_LABELS[a.view]}
        </span>
        {unavailable && (
          <span className="rounded-[2px] bg-ink px-2.5 py-1.5 text-xs font-bold text-stone md:text-[13px]">{STATUS_LABELS[a.status]}</span>
        )}
      </div>
      <span className="text-sm text-body md:text-[15px]">
        {a.priceOnRequest || a.priceFromDa === null ? "Prix sur demande" : `À partir de ${formatPriceDa(a.priceFromDa)}`}
      </span>
      <div className="mt-auto flex flex-col border-t border-card-line pt-1 md:flex-row md:items-center md:justify-between md:gap-3 md:pt-3">
        {a.planUrl ? (
          <a href={a.planUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-ink">
            <PlanIcon /> Voir le plan
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted">
            <PlanIcon /> Plan bientôt disponible
          </span>
        )}
        {!unavailable && (
          <Link href={`/contact?appartement=${a.number}`} className="inline-flex min-h-11 items-center text-[15px] font-bold">
            Se renseigner →
          </Link>
        )}
      </div>
    </article>
  );
}
