import { z } from "zod";
import { APARTMENT_STATUSES, APARTMENT_TYPES, APARTMENT_VIEWS, LEAD_STATUSES } from "../constants";
import { legalInfoSchema } from "./legal";

/** Schémas des routes d'administration (/api/v1/admin/*), partagés avec l'app mobile. */

const id = z.coerce.number().int().positive();
const nullableId = z.union([id, z.null()]);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis.").max(200),
});

export const passwordSchema = z
  .string()
  .min(10, "10 caractères minimum.")
  .max(200)
  .regex(/[a-zA-Z]/, "Au moins une lettre.")
  .regex(/\d/, "Au moins un chiffre.");

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

export const resetRequestSchema = z.object({ email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.") });
export const resetConfirmSchema = z.object({ token: z.string().min(20).max(200), newPassword: passwordSchema });

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(80),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: passwordSchema,
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    role: z.enum(["ADMIN", "EDITOR"]),
    isActive: z.boolean(),
  })
  .partial();

export const updateApartmentSchema = z
  .object({
    type: z.enum(APARTMENT_TYPES),
    surfaceM2: z.coerce.number().int().min(10).max(2000),
    floor: z.coerce.number().int().min(-3).max(60),
    view: z.enum(APARTMENT_VIEWS),
    priceFromDa: z.union([z.coerce.number().int().min(0).max(2_000_000_000), z.null()]),
    priceOnRequest: z.boolean(),
    status: z.enum(APARTMENT_STATUSES),
    hasTerrace: z.boolean(),
    isPublished: z.boolean(),
    planMediaId: nullableId,
  })
  .partial();

export const createApartmentSchema = updateApartmentSchema.required({
  type: true,
  surfaceM2: true,
  floor: true,
  view: true,
}).extend({ number: z.coerce.number().int().min(1).max(999) });

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    district: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(80),
    deliveryLabel: z.string().trim().min(2).max(60),
    currentPhaseOrder: z.coerce.number().int().min(1).max(20),
    features: z.array(z.string().trim().min(1).max(80)).max(10),
    coverMediaId: nullableId,
  })
  .partial();

export const createProgressPhotoSchema = z.object({
  mediaId: id,
  takenAt: z.coerce.date(),
  caption: z.string().trim().min(1, "Ajoutez une légende.").max(200),
});
export const updateProgressPhotoSchema = createProgressPhotoSchema.omit({ mediaId: true }).partial();

export const MEDIA_CATEGORIES = ["FACADE", "INTERIOR", "CONSTRUCTION", "PLAN", "LOGO", "OTHER"] as const;
export const updateMediaSchema = z
  .object({ alt: z.string().trim().max(200), category: z.enum(MEDIA_CATEGORIES) })
  .partial();

export const leadQuerySchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});
export const updateLeadSchema = z.object({ status: z.enum(LEAD_STATUSES) });

export const updateSettingsSchema = z
  .object({
    siteName: z.string().trim().min(2).max(80),
    tagline: z.string().trim().max(80),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur au format #RRGGBB."),
    phone: z.string().trim().min(8).max(25),
    whatsappNumber: z.string().trim().regex(/^\+\d{8,15}$/, "Format international attendu, ex. +213550333769."),
    whatsappMessage: z.string().trim().max(500),
    email: z.string().trim().email(),
    officeAddress: z.string().trim().min(5).max(200),
    seoTitle: z.string().trim().min(10).max(70),
    seoDescription: z.string().trim().min(30).max(170),
    legal: legalInfoSchema,
  })
  .partial();

export const STATS_PERIODS = ["today", "7d", "30d", "12m"] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];
export const statsQuerySchema = z.object({ period: z.enum(STATS_PERIODS).default("7d") });
