import { z } from "zod";
import { prisma } from "../../db";
import { notFound } from "../../http/response";
import type { createProgressPhotoSchema, updateProgressPhotoSchema, updateProjectSchema } from "@/shared/schemas/admin";
import { getDefaultProjectSlug } from "../project.service";

export async function getAdminProject() {
  const project = await prisma.project.findUnique({
    where: { slug: getDefaultProjectSlug() },
    include: {
      phases: { orderBy: { order: "asc" } },
      progressPhotos: { orderBy: { takenAt: "desc" }, include: { media: true } },
      coverMedia: true,
    },
  });
  if (!project) throw notFound("Programme introuvable. Lancez `npm run db:seed`.");
  return project;
}

export async function updateProject(id: number, input: z.infer<typeof updateProjectSchema>) {
  // Changer d'étape met à jour la date « Mise à jour » affichée sur la page Avancement.
  const touchesProgress = input.currentPhaseOrder !== undefined;
  return prisma.project.update({
    where: { id },
    data: { ...input, ...(touchesProgress ? { progressUpdatedAt: new Date() } : {}) },
  });
}

export async function addProgressPhoto(projectId: number, input: z.infer<typeof createProgressPhotoSchema>) {
  const media = await prisma.media.findUnique({ where: { id: input.mediaId }, select: { id: true } });
  if (!media) throw notFound("Photo introuvable dans les médias.");
  const photo = await prisma.progressPhoto.create({ data: { projectId, ...input }, include: { media: true } });
  await prisma.project.update({ where: { id: projectId }, data: { progressUpdatedAt: new Date() } });
  return photo;
}

export async function updateProgressPhoto(id: number, input: z.infer<typeof updateProgressPhotoSchema>) {
  return prisma.progressPhoto.update({ where: { id }, data: input });
}

export async function deleteProgressPhoto(id: number) {
  await prisma.progressPhoto.delete({ where: { id } });
}
