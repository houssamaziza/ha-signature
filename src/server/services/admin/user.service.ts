import { Prisma } from "@prisma/client";
import { prisma } from "../../db";
import { AppError } from "../../http/response";
import { hashPassword } from "../../auth/password";
import { deleteUserSessions } from "../../auth/session";
import type { UserDTO } from "@/shared/types/admin";

const select = { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true } as const;
type Row = Prisma.UserGetPayload<{ select: typeof select }>;
const toDTO = (u: Row): UserDTO => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null });

export async function listUsers(): Promise<UserDTO[]> {
  return (await prisma.user.findMany({ select, orderBy: { createdAt: "asc" } })).map(toDTO);
}

export async function createUser(input: { email: string; name: string; role: "ADMIN" | "EDITOR"; password: string }) {
  try {
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, role: input.role, passwordHash: await hashPassword(input.password) },
      select,
    });
    return toDTO(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new AppError(409, "EMAIL_TAKEN", "Un compte existe déjà avec cet e-mail.");
    }
    throw e;
  }
}

export async function updateUser(actorId: number, id: number, input: { name?: string; role?: "ADMIN" | "EDITOR"; isActive?: boolean }) {
  if (actorId === id && (input.isActive === false || input.role === "EDITOR")) {
    throw new AppError(400, "SELF_LOCKOUT", "Vous ne pouvez pas retirer vos propres droits d’administrateur.");
  }
  const user = await prisma.user.update({ where: { id }, data: input, select });
  if (input.isActive === false) await deleteUserSessions(id);
  return toDTO(user);
}
