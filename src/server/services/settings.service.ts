import { cache } from "react";
import { prisma } from "../db";
import { legalInfoSchema, type LegalInfo } from "@/shared/schemas/legal";
import type { PublicSettingsDTO } from "@/shared/types/api";
import { DEFAULT_SETTINGS } from "@/shared/defaults";

export type SiteSettings = PublicSettingsDTO & { legal: LegalInfo };

/** Paramètres du site, mémorisés pour la durée d'une requête. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  let row;
  try {
    row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  } catch (err) {
    // Base indisponible : le site reste affichable avec les coordonnées par défaut.
    console.error("[settings] lecture impossible, valeurs par défaut utilisées", err);
    return { ...DEFAULT_SETTINGS, legal: {} };
  }
  if (!row) return { ...DEFAULT_SETTINGS, legal: {} };

  const legal = legalInfoSchema.safeParse(row.legal);
  return {
    siteName: row.siteName,
    tagline: row.tagline,
    accentColor: /^#[0-9a-fA-F]{6}$/.test(row.accentColor) ? row.accentColor : DEFAULT_SETTINGS.accentColor,
    phone: row.phone,
    whatsappNumber: row.whatsappNumber,
    whatsappMessage: row.whatsappMessage,
    email: row.email,
    officeAddress: row.officeAddress,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    legal: legal.success ? legal.data : {},
  };
});

/** Version publique (sans les informations légales), exposée par l'API. */
export async function getPublicSettings(): Promise<PublicSettingsDTO> {
  const { legal: _legal, ...publicSettings } = await getSettings();
  return publicSettings;
}
