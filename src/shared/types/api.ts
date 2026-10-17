import type { ApartmentStatus, ApartmentType, ApartmentView } from "../constants";

/**
 * Formes des réponses de l'API /api/v1.
 * Succès : { data: T } — Erreur : { error: { code, message, details? } }
 * Ces types sont destinés à être partagés avec l'application mobile.
 */
export type ApiSuccess<T> = { data: T };
export type ApiError = { error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ApartmentDTO = {
  id: number;
  number: number;
  type: ApartmentType;
  surfaceM2: number;
  floor: number;
  view: ApartmentView;
  priceFromDa: number | null;
  priceOnRequest: boolean;
  status: ApartmentStatus;
  hasTerrace: boolean;
  planUrl: string | null;
};

export type PhaseDTO = {
  order: number;
  name: string;
  description: string;
  state: "done" | "current" | "upcoming";
};

export type ProgressPhotoDTO = {
  id: number;
  url: string;
  alt: string;
  takenAt: string;
  caption: string;
};

export type ProjectDTO = {
  id: number;
  slug: string;
  name: string;
  district: string;
  city: string;
  deliveryLabel: string;
  currentPhaseOrder: number;
  progressUpdatedAt: string | null;
  features: string[];
  cover: { url: string; alt: string } | null;
  apartments: ApartmentDTO[];
  phases: PhaseDTO[];
  progressPhotos: ProgressPhotoDTO[];
};

export type PublicSettingsDTO = {
  siteName: string;
  tagline: string;
  accentColor: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  officeAddress: string;
  seoTitle: string;
  seoDescription: string;
};
