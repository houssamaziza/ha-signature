import { AppError } from "../http/response";
import { SESSION_COOKIE, findSession, readCookie, type SessionUser } from "./session";

export type AuthContext = { user: SessionUser; sessionId: string; token: string };

function extractToken(req: Request): { token: string | null; viaCookie: boolean } {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return { token: auth.slice(7).trim(), viaCookie: false };
  return { token: readCookie(req.headers.get("cookie"), SESSION_COOKIE), viaCookie: true };
}

/** Protection CSRF : une écriture authentifiée par cookie doit venir du même site. */
function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let ok = false;
  try {
    ok = !!origin && !!host && new URL(origin).host === host;
  } catch {
    ok = false;
  }
  if (!ok) throw new AppError(403, "CSRF", "Requête refusée (origine invalide).");
}

/**
 * À appeler en tête de chaque route d'administration.
 * `role: "ADMIN"` limite l'action aux administrateurs (gestion des comptes…).
 */
export async function requireAuth(req: Request, opts: { role?: "ADMIN" } = {}): Promise<AuthContext> {
  const { token, viaCookie } = extractToken(req);
  const session = await findSession(token);
  if (!session || !token) throw new AppError(401, "UNAUTHENTICATED", "Veuillez vous connecter.");
  if (viaCookie && req.method !== "GET" && req.method !== "HEAD") assertSameOrigin(req);
  if (opts.role === "ADMIN" && session.user.role !== "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "Action réservée aux administrateurs.");
  }
  return { user: session.user, sessionId: session.id, token };
}
