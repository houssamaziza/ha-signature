import { createHash, randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { prisma } from "../db";

/**
 * Sessions opaques partagées par le web et le mobile.
 *  - Web : jeton dans un cookie httpOnly `has_session`.
 *  - Mobile : même jeton, envoyé en `Authorization: Bearer <jeton>`.
 * Seul le SHA-256 du jeton est stocké en base.
 */
export const SESSION_COOKIE = "has_session";
// Connexion mémorisée 1 an sur l'appareil (déconnexion possible à tout moment depuis l'administration).
const TTL_MS = { web: 365 * 24 * 3600_000, mobile: 365 * 24 * 3600_000 } as const;
export type SessionClient = keyof typeof TTL_MS;

export type SessionUser = { id: number; email: string; name: string; role: Role };

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number, client: SessionClient, userAgent: string | null) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS[client]);
  await prisma.session.create({
    data: { id: hashToken(token), userId, client, userAgent: userAgent?.slice(0, 300) ?? null, expiresAt },
  });
  return { token, expiresAt };
}

export async function findSession(token: string | null | undefined): Promise<{ id: string; user: SessionUser } | null> {
  if (!token || token.length > 200) return null;
  const session = await prisma.session.findUnique({ where: { id: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;

  // Mise à jour de lastUsedAt au plus une fois par heure, sans bloquer la requête.
  if (Date.now() - session.lastUsedAt.getTime() > 3600_000) {
    prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  }
  const { id, email, name, role } = session.user;
  return { id: session.id, user: { id, email, name, role } };
}

export async function deleteSession(token: string | null | undefined) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { id: hashToken(token) } });
}

export async function deleteUserSessions(userId: number, exceptSessionId?: string) {
  await prisma.session.deleteMany({ where: { userId, ...(exceptSessionId ? { NOT: { id: exceptSessionId } } : {}) } });
}

/** Lit un cookie dans l'en-tête Cookie brut. */
export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}
