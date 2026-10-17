import { randomBytes } from "node:crypto";
import { prisma } from "../../db";
import { AppError } from "../../http/response";
import { hashPassword } from "../../auth/password";
import { deleteUserSessions, hashToken } from "../../auth/session";
import { sendEmail } from "../../email/mailer";
import { passwordResetEmail } from "../../email/templates";

const TTL_MS = 3600_000;

/**
 * Envoie un lien de réinitialisation si le compte existe et est actif.
 * Ne révèle jamais si l'e-mail est connu (même réponse dans tous les cas).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return;

  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({ data: { id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + TTL_MS) } });
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const mail = passwordResetEmail({ name: user.name, url: `${base}/admin/reinitialiser?jeton=${token}` });
  await sendEmail({ to: [user.email], ...mail });
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  const row = await prisma.passwordResetToken.findUnique({ where: { id: hashToken(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    throw new AppError(400, "INVALID_TOKEN", "Ce lien n’est plus valable. Demandez-en un nouveau.");
  }
  // Le jeton est invalidé d'abord : un double clic ne peut pas l'utiliser deux fois.
  await prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  await prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(newPassword) } });
  await deleteUserSessions(row.userId); // déconnecte tous les appareils
}
