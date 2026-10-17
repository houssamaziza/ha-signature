/**
 * Libellés et constantes partagés entre le site, l'API et la future app mobile.
 * Aucune dépendance serveur ici : ce dossier peut être extrait dans un
 * paquet commun (monorepo) le jour où l'application Expo démarre.
 */

export const APARTMENT_TYPES = ["F2", "F3", "F4", "F5", "PENTHOUSE"] as const;
export type ApartmentType = (typeof APARTMENT_TYPES)[number];

export const APARTMENT_VIEWS = ["SEA", "CITY"] as const;
export type ApartmentView = (typeof APARTMENT_VIEWS)[number];

export const APARTMENT_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"] as const;
export type ApartmentStatus = (typeof APARTMENT_STATUSES)[number];

export const LEAD_STATUSES = ["NEW", "CALLED", "VISIT_SCHEDULED", "ARCHIVED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const TYPE_LABELS: Record<ApartmentType, string> = {
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  PENTHOUSE: "Penthouse",
};

export const VIEW_LABELS: Record<ApartmentView, string> = {
  SEA: "Vue sur mer",
  CITY: "Vue sur le quartier",
};

export const STATUS_LABELS: Record<ApartmentStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  SOLD: "Vendu",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouvelle",
  CALLED: "Rappelé",
  VISIT_SCHEDULED: "Visite prévue",
  ARCHIVED: "Archivée",
};

/** -1 = entresol, 0 = rez-de-chaussée, 1 = 1er étage, n = n-ième étage. */
export function floorLabel(floor: number): string {
  if (floor === -1) return "Entresol";
  if (floor === 0) return "Rez-de-chaussée";
  if (floor === 1) return "1er étage";
  return `${floor}e étage`;
}

export function floorShortLabel(floor: number): string {
  if (floor === -1) return "Entresol";
  if (floor === 0) return "RDC";
  return floorLabel(floor);
}

export const CONSENT_STORAGE_KEY = "has-consent";
export const VISITOR_STORAGE_KEY = "has-visitor";
