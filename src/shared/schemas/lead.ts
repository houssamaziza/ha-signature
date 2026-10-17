import { z } from "zod";

/** Téléphone algérien ou international : chiffres, espaces, +, tirets, points, parenthèses. */
const phoneSchema = z
  .string()
  .trim()
  .min(8, "Numéro de téléphone trop court.")
  .max(25, "Numéro de téléphone trop long.")
  .regex(/^\+?[\d\s().-]+$/, "Numéro de téléphone invalide.");

/** Demande envoyée par le formulaire de contact (web ou mobile). */
export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  phone: phoneSchema,
  email: z
    .union([z.literal(""), z.string().trim().email("Adresse e-mail invalide.").max(200)])
    .optional()
    .transform((v) => (v ? v : undefined)),
  /** Numéro d'appartement affiché (1-999) ; absent = « je ne sais pas encore ». */
  apartmentNumber: z.coerce.number().int().min(1).max(999).optional(),
  message: z.string().trim().max(2000).optional(),
  /** Consentement obligatoire (loi 18-07). */
  consent: z.literal(true, { error: "Votre accord est nécessaire pour que nous puissions vous répondre." }),
  /** Champ piège anti-robots : doit rester vide. */
  website: z.string().max(0).optional(),
});

export type CreateLeadInput = z.input<typeof createLeadSchema>;
export type CreateLead = z.output<typeof createLeadSchema>;
