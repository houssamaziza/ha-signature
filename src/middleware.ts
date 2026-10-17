import { NextResponse, type NextRequest } from "next/server";

/**
 * 1. Verrou temporaire du site (avant le lancement public) :
 *    si la variable SITE_LOCK_HASH est définie (sha256 hexadécimal du mot de passe),
 *    tout le site demande ce mot de passe (authentification HTTP Basic, nom libre).
 *    Pour ouvrir le site au public : supprimer SITE_LOCK_HASH de wrangler.jsonc.
 *
 * 2. Filtre léger de l'administration : sans cookie de session, on renvoie vers la connexion.
 *    La vérification réelle (session valide, compte actif) est faite côté serveur
 *    dans le layout de l'administration et dans chaque route d'API.
 */

/** Pages de l'administration accessibles sans être connecté. */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/connexion", "/admin/mot-de-passe-oublie", "/admin/reinitialiser"]);

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isUnlocked(req: NextRequest, expectedHash: string): Promise<boolean> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const password = decoded.slice(decoded.indexOf(":") + 1);
  return safeEqual(await sha256Hex(password), expectedHash.toLowerCase());
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const lockHash = process.env.SITE_LOCK_HASH;
  if (lockHash && !(await isUnlocked(req, lockHash))) {
    return new NextResponse("Site en préparation — accès réservé.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="H&A Signature", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
      },
    });
  }

  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname) && !req.cookies.has("has_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = `?suite=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  if (lockHash || pathname.startsWith("/admin")) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
