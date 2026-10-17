import type { Apartment, Media } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { AppError, notFound } from "../../http/response";
import type { createApartmentSchema, updateApartmentSchema } from "@/shared/schemas/admin";

export type AdminApartment = Omit<Apartment, "createdAt" | "updatedAt"> & {
  plan: Pick<Media, "id" | "url" | "filename"> | null;
  leadsCount: number;
};

export async function listAdminApartments(projectId: number): Promise<AdminApartment[]> {
  const rows = await prisma.apartment.findMany({
    where: { projectId },
    orderBy: { number: "asc" },
    include: { planMedia: { select: { id: true, url: true, filename: true } }, _count: { select: { leads: true } } },
  });
  return rows.map(({ planMedia, _count, createdAt: _c, updatedAt: _u, ...a }) => ({ ...a, plan: planMedia, leadsCount: _count.leads }));
}

export async function updateApartment(id: number, input: z.infer<typeof updateApartmentSchema>) {
  const exists = await prisma.apartment.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound("Logement introuvable.");
  return prisma.apartment.update({ where: { id }, data: input });
}

export async function createApartment(projectId: number, input: z.infer<typeof createApartmentSchema>) {
  try {
    return await prisma.apartment.create({ data: { ...input, projectId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new AppError(409, "NUMBER_TAKEN", `Le numéro ${input.number} est déjà utilisé.`);
    }
    throw e;
  }
}
