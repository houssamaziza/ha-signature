import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { toFeatures } from "@/shared/features";
import type { ApartmentDTO, PhaseDTO, ProjectDTO } from "@/shared/types/api";
import type { ApartmentStatus, ApartmentView } from "@/shared/constants";

const projectInclude = {
  coverMedia: true,
  apartments: {
    where: { isPublished: true },
    orderBy: { number: "asc" },
    include: { planMedia: true },
  },
  phases: { orderBy: { order: "asc" } },
  progressPhotos: { orderBy: { takenAt: "desc" }, include: { media: true } },
} satisfies Prisma.ProjectInclude;

type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;
type ApartmentWithPlan = ProjectWithRelations["apartments"][number];

export function getDefaultProjectSlug(): string {
  return process.env.DEFAULT_PROJECT_SLUG ?? "la-caroube-2";
}

function toApartmentDTO(a: ApartmentWithPlan): ApartmentDTO {
  return {
    id: a.id,
    number: a.number,
    type: a.type,
    surfaceM2: a.surfaceM2,
    floor: a.floor,
    view: a.view,
    priceFromDa: a.priceOnRequest ? null : a.priceFromDa,
    priceOnRequest: a.priceOnRequest,
    status: a.status,
    hasTerrace: a.hasTerrace,
    planUrl: a.planMedia?.url ?? null,
  };
}

function phaseState(order: number, current: number): PhaseDTO["state"] {
  if (order < current) return "done";
  if (order === current) return "current";
  return "upcoming";
}

function toProjectDTO(p: ProjectWithRelations): ProjectDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    district: p.district,
    city: p.city,
    deliveryLabel: p.deliveryLabel,
    currentPhaseOrder: p.currentPhaseOrder,
    progressUpdatedAt: p.progressUpdatedAt?.toISOString() ?? null,
    features: toFeatures(p.features),
    cover: p.coverMedia ? { url: p.coverMedia.url, alt: p.coverMedia.alt } : null,
    apartments: p.apartments.map(toApartmentDTO),
    phases: p.phases.map((ph) => ({
      order: ph.order,
      name: ph.name,
      description: ph.description,
      state: phaseState(ph.order, p.currentPhaseOrder),
    })),
    progressPhotos: p.progressPhotos.map((pp) => ({
      id: pp.id,
      url: pp.media.url,
      alt: pp.media.alt || pp.caption,
      takenAt: pp.takenAt.toISOString(),
      caption: pp.caption,
    })),
  };
}

/** Programme complet (logements publiés, étapes, photos), mémorisé par requête. */
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDTO | null> => {
  const project = await prisma.project.findUnique({ where: { slug }, include: projectInclude });
  return project ? toProjectDTO(project) : null;
});

export async function getDefaultProject(): Promise<ProjectDTO | null> {
  return getProjectBySlug(getDefaultProjectSlug());
}

export type ApartmentFilters = {
  projectSlug: string;
  status?: ApartmentStatus;
  view?: ApartmentView;
};

export async function listApartments(filters: ApartmentFilters): Promise<ApartmentDTO[]> {
  const rows = await prisma.apartment.findMany({
    where: {
      isPublished: true,
      project: { slug: filters.projectSlug },
      status: filters.status,
      view: filters.view,
    },
    orderBy: { number: "asc" },
    include: { planMedia: true },
  });
  return rows.map(toApartmentDTO);
}
