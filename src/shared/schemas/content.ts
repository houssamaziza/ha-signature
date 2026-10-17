import { z } from "zod";

/**
 * Blocs de contenu éditables depuis l'administration (table ContentBlock).
 * Chaque bloc a un schéma et une valeur par défaut : le site reste
 * affichable même si la base ne contient pas encore le bloc.
 */

export const buttonSchema = z.object({
  label: z.string().min(1).max(60),
  /** Lien interne ("/appartements"), tel:, https://wa.me/… ou externe. */
  href: z.string().min(1).max(500),
  variant: z.enum(["primary", "secondary", "accent"]).default("primary"),
});
export type ContentButton = z.infer<typeof buttonSchema>;

export const heroBlockSchema = z.object({
  eyebrow: z.string().max(80),
  title: z.string().max(160),
  text: z.string().max(600),
  buttons: z.array(buttonSchema).max(3),
  imageUrl: z.string(),
  imageAlt: z.string().max(200),
});
export type HeroBlock = z.infer<typeof heroBlockSchema>;

export const stepsBlockSchema = z.object({
  title: z.string().max(160),
  text: z.string().max(400),
  steps: z
    .array(z.object({ title: z.string().max(60), text: z.string().max(240) }))
    .max(6),
});
export type StepsBlock = z.infer<typeof stepsBlockSchema>;

export const CONTENT_DEFAULTS = {
  "home.hero": {
    eyebrow: "Construire pour durer",
    title: "Des lieux de vie pensés, bâtis et livrés avec exigence.",
    text: "H&A Signature construit et vend à Annaba des appartements spacieux, dont 5 avec vue sur mer, livrés en semi-fini ou avec les finitions de votre choix.",
    buttons: [
      { label: "Découvrir nos appartements", href: "/appartements", variant: "primary" },
      { label: "Prendre rendez-vous", href: "/contact", variant: "secondary" },
    ],
    imageUrl: "/images/facade-avant.jpg",
    imageAlt: "Façade avant de la résidence H&A Signature à la tombée de la nuit",
  },
  "home.steps": {
    title: "Un seul interlocuteur, de la visite à la remise des clés.",
    text: "Nous pilotons chaque étape en interne pour garantir la qualité, le respect des délais et la transparence envers nos acquéreurs.",
    steps: [
      { title: "Visite", text: "Découvrez les plans et choisissez l’appartement qui vous correspond." },
      { title: "Réservation", text: "Un conseiller vous accompagne dans toutes les démarches d’achat." },
      { title: "Construction", text: "Suivez l’avancement du chantier jusqu’à la fin des travaux." },
      { title: "Remise des clés", text: "Votre appartement est livré en semi-fini ou avec les finitions que vous avez choisies." },
    ],
  },
} satisfies { "home.hero": HeroBlock; "home.steps": StepsBlock };

export const CONTENT_SCHEMAS = {
  "home.hero": heroBlockSchema,
  "home.steps": stepsBlockSchema,
} as const;

export type ContentKey = keyof typeof CONTENT_SCHEMAS;
export type ContentOf<K extends ContentKey> = z.infer<(typeof CONTENT_SCHEMAS)[K]>;
