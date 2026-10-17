import type { MediaCategory } from "@prisma/client";
import { prisma } from "../../db";
import { AppError, notFound } from "../../http/response";
import { deleteUpload, saveUpload } from "../../storage/files";
import type { MediaDTO } from "@/shared/types/admin";

const include = {
  projectCovers: { select: { name: true } },
  apartmentPlans: { select: { number: true } },
  progressPhotos: { select: { id: true } },
} as const;

export async function listMedia(category?: MediaCategory): Promise<MediaDTO[]> {
  const rows = await prisma.media.findMany({ where: { category }, orderBy: { createdAt: "desc" }, include });
  // Utilisations dans les blocs de contenu (ex. photo du haut de l'accueil).
  const blocks = await prisma.contentBlock.findMany({ select: { key: true, data: true } });
  return rows.map((m) => {
    const usage = [
      ...m.projectCovers.map((p) => `Photo principale · ${p.name}`),
      ...m.apartmentPlans.map((a) => `Plan · appartement ${String(a.number).padStart(2, "0")}`),
      ...(m.progressPhotos.length ? [`Avancement · ${m.progressPhotos.length} photo(s)`] : []),
      ...blocks.filter((b) => JSON.stringify(b.data).includes(`"${m.url}"`)).map((b) => `Contenu · ${b.key}`),
    ];
    return {
      id: m.id,
      url: m.url,
      filename: m.filename,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      alt: m.alt,
      category: m.category,
      createdAt: m.createdAt.toISOString(),
      usage,
    };
  });
}

export async function uploadMedia(file: File, alt: string, category: MediaCategory) {
  const saved = await saveUpload(file);
  return prisma.media.create({ data: { ...saved, alt: alt.slice(0, 200), category } });
}

export async function updateMedia(id: number, input: { alt?: string; category?: MediaCategory }) {
  return prisma.media.update({ where: { id }, data: input });
}

export async function deleteMedia(id: number) {
  const media = await prisma.media.findUnique({ where: { id }, include });
  if (!media) throw notFound("Média introuvable.");
  const blocks = await prisma.contentBlock.findMany({ select: { data: true } });
  if (media.projectCovers.length || blocks.some((b) => JSON.stringify(b.data).includes(`"${media.url}"`))) {
    throw new AppError(409, "MEDIA_IN_USE", "Cette photo est utilisée sur le site. Remplacez-la d’abord.");
  }
  // Les plans liés repassent à « bientôt disponible » ; les photos d'avancement liées sont supprimées.
  await prisma.media.delete({ where: { id } });
  await deleteUpload(media.url);
}
