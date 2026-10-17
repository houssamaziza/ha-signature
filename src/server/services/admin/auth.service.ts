import { prisma } from "../../db";
import { AppError } from "../../http/response";
import { DUMMY_HASH, hashPassword, verifyPassword } from "../../auth/password";
import { createSession, deleteUserSessions, type SessionClient } from "../../auth/session";

const invalid = () => new AppError(401, "INVALID_CREDENTIALS", "E-mail ou mot de passe incorrect.");

export async function login(email: string, password: string, client: SessionClient, userAgent: string | null) {
  const user = await prisma.user.findUnique({ where: { email } });
  // On vérifie toujours un hash pour ne pas révéler si l'e-mail existe.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.isActive) throw invalid();

  const session = await createSession(user.id, client, userAgent);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ...session, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function changePassword(userId: number, sessionId: string, current: string, next: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(current, user.passwordHash))) {
    throw new AppError(400, "WRONG_PASSWORD", "Le mot de passe actuel est incorrect.");
  }
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(next) } });
  // Déconnecte les autres appareils.
  await deleteUserSessions(userId, sessionId);
}
