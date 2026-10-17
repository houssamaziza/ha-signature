import { NextResponse, type NextRequest } from "next/server";

/**
 * 1. Verrou temporaire du site (avant le lancement public).
 *    Actif si SITE_LOCK_HASH est défini (sha256 hexadécimal du mot de passe d'accès).
 *    - Sans accès : page « Accès réservé » avec un formulaire que le trousseau
 *      (iCloud, Face ID, gestionnaires de mots de passe) sait mémoriser et remplir.
 *    - Après le bon mot de passe : cookie de déverrouillage valable 1 an.
 *      Jeton = sha256("cookie|" + mot de passe) ; on vérifie sha256(jeton) === SITE_LOCK_COOKIE_CHECK,
 *      donc rien de ce qui est dans le dépôt ne permet de fabriquer le cookie.
 *    - L'en-tête Authorization: Basic reste accepté (outils, tests).
 *    Pour ouvrir le site au public : supprimer SITE_LOCK_HASH de wrangler.jsonc.
 *
 * 2. Filtre léger de l'administration : sans cookie de session, on renvoie vers la connexion.
 *    La vérification réelle est faite côté serveur (layout de l'administration, routes d'API).
 */

const PUBLIC_ADMIN_PATHS = new Set(["/admin/connexion", "/admin/mot-de-passe-oublie", "/admin/reinitialiser"]);
const UNLOCK_PATH = "/acces";
const UNLOCK_COOKIE = "has_unlock";
const ONE_YEAR = 60 * 60 * 24 * 365;

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

async function passwordMatches(password: string, lockHash: string) {
  return safeEqual(await sha256Hex(password), lockHash.toLowerCase());
}

async function isUnlocked(req: NextRequest, lockHash: string, cookieCheck: string | undefined): Promise<boolean> {
  const token = req.cookies.get(UNLOCK_COOKIE)?.value;
  if (token && cookieCheck && safeEqual(await sha256Hex(token), cookieCheck.toLowerCase())) return true;

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      return passwordMatches(decoded.slice(decoded.indexOf(":") + 1), lockHash);
    } catch {
      return false;
    }
  }
  return false;
}

/** Ne garde que les chemins internes au site (évite les redirections ouvertes). */
function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith(UNLOCK_PATH)) return "/";
  return value;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const LOCK_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
};

function lockPage(next: string, error = false, status = 401) {
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Accès réservé — H&amp;A Signature</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#F3EFE7;color:#1D2422;font-family:Manrope,"Helvetica Neue",Arial,sans-serif}
main{width:100%;max-width:400px;display:flex;flex-direction:column;gap:22px}
.logo{font-family:Georgia,"Times New Roman",serif;font-size:32px;font-weight:600;letter-spacing:-.5px}
.logo em{font-weight:400}
h1{margin:0;font-family:Georgia,serif;font-weight:400;font-size:26px}
p{margin:0;font-size:15px;line-height:1.55;color:#444A45}
form{display:flex;flex-direction:column;gap:16px}
label{display:flex;flex-direction:column;gap:8px;font-size:14px;font-weight:700}
input{height:52px;padding:0 16px;border:1px solid #8C8578;background:#FBF9F5;font-size:16px;font-family:inherit;border-radius:2px;width:100%}
input:focus{outline:2px solid #8A4B24;outline-offset:1px}
button{height:54px;border:none;border-radius:2px;background:#8A4B24;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer}
button:hover{background:#6B3818}
.err{padding:12px 14px;background:#F6E3DA;color:#7A2E12;font-size:14px;border-radius:2px}
</style></head>
<body><main>
<div class="logo">H&amp;A <em>Signature</em></div>
<h1>Site en préparation</h1>
<p>L’accès est réservé pour le moment. Entrez le mot de passe du site : votre appareil pourra le mémoriser et le remplir avec Face ID.</p>
${error ? '<div class="err" role="alert">Mot de passe incorrect. Réessayez.</div>' : ""}
<form method="post" action="${UNLOCK_PATH}">
<input type="hidden" name="suite" value="${escapeHtml(next)}">
<label>Identifiant<input name="username" type="text" autocomplete="username" value="hasignature" autocapitalize="none" spellcheck="false" required></label>
<label>Mot de passe du site<input name="password" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required autofocus></label>
<button type="submit">Entrer</button>
</form>
</main></body></html>`;
  return new NextResponse(html, { status, headers: LOCK_HEADERS });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lockHash = process.env.SITE_LOCK_HASH;
  const cookieCheck = process.env.SITE_LOCK_COOKIE_CHECK;

  if (lockHash) {
    if (pathname === UNLOCK_PATH && req.method === "POST") {
      let password = "";
      let next = "/";
      try {
        const form = await req.formData();
        password = String(form.get("password") ?? "");
        next = safeNext(String(form.get("suite") ?? "/"));
      } catch {
        /* formulaire illisible : traité comme un mauvais mot de passe */
      }
      if (!(await passwordMatches(password, lockHash))) return lockPage(next, true);
      const res = NextResponse.redirect(new URL(next, req.url), 303);
      res.cookies.set(UNLOCK_COOKIE, await sha256Hex(`cookie|${password}`), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: ONE_YEAR,
      });
      return res;
    }

    if (!(await isUnlocked(req, lockHash, cookieCheck))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: { code: "SITE_LOCKED", message: "Site en préparation — accès réservé." } },
          { status: 401, headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } },
        );
      }
      const next = pathname === UNLOCK_PATH ? safeNext(req.nextUrl.searchParams.get("suite")) : safeNext(pathname + req.nextUrl.search);
      return lockPage(next);
    }

    if (pathname === UNLOCK_PATH) return NextResponse.redirect(new URL(safeNext(req.nextUrl.searchParams.get("suite")), req.url), 303);
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
