import { prisma } from "../../db";
import { getDefaultProjectSlug } from "../project.service";

export async function getDashboard() {
  const since7d = new Date(Date.now() - 7 * 86400_000);
  const project = await prisma.project.findUnique({
    where: { slug: getDefaultProjectSlug() },
    include: { phases: { orderBy: { order: "asc" } } },
  });
  const [newLeads, apartmentsByStatus, visitors, recentLeads] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.apartment.groupBy({ by: ["status"], where: { projectId: project?.id }, _count: { _all: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: since7d } }, distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { apartment: { select: { number: true } } } }),
  ]);
  const count = (s: string) => apartmentsByStatus.find((a) => a.status === s)?._count._all ?? 0;
  return {
    newLeads,
    apartments: { available: count("AVAILABLE"), reserved: count("RESERVED"), sold: count("SOLD") },
    currentPhase: project?.phases.find((p) => p.order === project.currentPhaseOrder)?.name ?? "—",
    deliveryLabel: project?.deliveryLabel ?? "",
    visitors7d: visitors.length,
    recentLeads,
  };
}
