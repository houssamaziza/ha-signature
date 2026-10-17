import type { PublicSettingsDTO } from "./types/api";

/** Valeurs utilisées tant que la ligne SiteSettings n'existe pas (avant le seed). */
export const DEFAULT_SETTINGS: PublicSettingsDTO = {
  siteName: "H&A Signature",
  tagline: "Promotion immobilière",
  accentColor: "#8A4B24",
  phone: "0550 33 37 69",
  whatsappNumber: "+213550333769",
  whatsappMessage:
    "Bonjour, je souhaite avoir des informations sur les appartements de la résidence La Caroube 2.",
  email: "info@hasignature.com",
  officeAddress: "Lot 214, La Caroube 2, Sidi Aïssa, Annaba",
  seoTitle: "H&A Signature — Appartements avec vue sur mer à Annaba",
  seoDescription:
    "Appartements F4 de 135 m² et penthouse à La Caroube 2, Sidi Aïssa, Annaba. Livraison janvier 2028.",
};
