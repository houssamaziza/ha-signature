import { NextResponse, type NextRequest } from "next/server";

/**
 * Filtre léger : sans cookie de session, on renvoie vers la connexion.
 * La vérification réelle (session valide, compte actif) est faite côté serveur
 * dans le layout de l'administration et dans chaque route d'API.
 */
/** Pages de l'administration accessibles sans être connecté. */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/connexion", "/admin/mot-de-passe-oublie", "/admin/reinitialiser"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname) && !req.cookies.has("has_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = `?suite=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  if (pathname.startsWith("/admin")) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
