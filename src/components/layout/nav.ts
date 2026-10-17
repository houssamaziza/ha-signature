export const NAV_ITEMS = [
  { href: "/", label: "Accueil", description: "La résidence H&A Signature" },
  { href: "/appartements", label: "Nos appartements", description: "Les logements et leurs plans" },
  { href: "/avancement", label: "Avancement", description: "Suivi du chantier" },
  { href: "/contact", label: "Contact", description: "Rendez-vous et informations" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
