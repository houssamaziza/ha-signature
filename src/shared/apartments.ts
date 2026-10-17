import { TYPE_LABELS, floorLabel } from "./constants";
import { formatApartmentNumber } from "./format";
import type { ApartmentDTO } from "./types/api";

/** "Appt. 07 — F4 135 m² · 1er étage · vue sur mer" */
export function apartmentOptionLabel(a: ApartmentDTO): string {
  const view = a.view === "SEA" ? "vue sur mer" : "vue sur le quartier";
  return `Appt. ${formatApartmentNumber(a.number)} — ${TYPE_LABELS[a.type]} ${a.surfaceM2} m² · ${floorLabel(a.floor)} · ${view}`;
}

/** Plus petit prix « à partir de » parmi les logements disponibles. */
export function lowestPrice(apartments: ApartmentDTO[]): number | null {
  const prices = apartments
    .filter((a) => a.status === "AVAILABLE" && a.priceFromDa !== null)
    .map((a) => a.priceFromDa as number);
  return prices.length ? Math.min(...prices) : null;
}

/** Résumé type « 10 F4 de 135 m² et un penthouse ». */
export function summarize(apartments: ApartmentDTO[]) {
  const penthouses = apartments.filter((a) => a.type === "PENTHOUSE");
  const others = apartments.filter((a) => a.type !== "PENTHOUSE");
  const seaCount = apartments.filter((a) => a.view === "SEA").length;
  const sameType = others.length > 0 && others.every((a) => a.type === others[0]!.type && a.surfaceM2 === others[0]!.surfaceM2);
  const unit = sameType ? `${TYPE_LABELS[others[0]!.type]} de ${others[0]!.surfaceM2} m²` : "appartements";
  return {
    total: apartments.length,
    penthouses,
    others,
    seaCount,
    /** « F4 de 135 m² » */
    othersUnit: unit,
    /** « 10 F4 de 135 m² » */
    othersLabel: `${others.length} ${unit}`,
    /** « 10 appartements F4 de 135 m² » */
    othersTitle: sameType ? `${others.length} appartements ${unit}` : `${others.length} appartements`,
  };
}

/** « Appt. 07 · F4 · 1er étage · vue mer » à partir des champs bruts. */
export function apartmentShortLabel(a: { number: number; type: ApartmentDTO["type"]; floor: number; view: ApartmentDTO["view"] }): string {
  return `Appt. ${formatApartmentNumber(a.number)} · ${TYPE_LABELS[a.type]} · ${floorLabel(a.floor)} · ${a.view === "SEA" ? "vue mer" : "vue quartier"}`;
}
