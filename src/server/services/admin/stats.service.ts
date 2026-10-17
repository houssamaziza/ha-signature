import { prisma } from "../../db";
import type { StatsPeriod } from "@/shared/schemas/admin";
import type { StatsDTO } from "@/shared/types/admin";

/**
 * Statistiques calculées en mémoire à partir des pages vues de la période.
 * Adapté au volume d'un site vitrine ; au-delà de MAX_ROWS, les plus anciennes
 * visites de la période sont ignorées (prévoir alors des agrégats quotidiens).
 */
const MAX_ROWS = 50_000;

type Unit = "hour" | "day" | "month";

/** Date et heure « murales » à Alger (UTC+1, sans heure d'été). */
const ALGIERS_OFFSET_MS = 60 * 60_000;
const toAlgiers = (d: Date) => new Date(d.getTime() + ALGIERS_OFFSET_MS);
const fromAlgiers = (d: Date) => new Date(d.getTime() - ALGIERS_OFFSET_MS);

function periodStart(period: StatsPeriod): { since: Date; unit: Unit } {
  const now = new Date();
  switch (period) {
    case "today": {
      const local = toAlgiers(now);
      local.setUTCHours(0, 0, 0, 0);
      return { since: fromAlgiers(local), unit: "hour" };
    }
    case "30d":
      return { since: new Date(now.getTime() - 30 * 86400_000), unit: "day" };
    case "12m": {
      const local = toAlgiers(now);
      const start = new Date(Date.UTC(local.getUTCFullYear() - 1, local.getUTCMonth() + 1, 1));
      return { since: fromAlgiers(start), unit: "month" };
    }
    default:
      return { since: new Date(now.getTime() - 7 * 86400_000), unit: "day" };
  }
}

/** Début de l'intervalle (heure, jour ou mois, heure d'Alger) contenant la date. */
function bucketOf(d: Date, unit: Unit): string {
  const l = toAlgiers(d);
  if (unit === "month") l.setUTCDate(1);
  if (unit !== "hour") l.setUTCHours(0);
  l.setUTCMinutes(0, 0, 0);
  return fromAlgiers(l).toISOString();
}

/** Compte les visiteurs uniques par clé, triés par ordre décroissant. */
function countDistinct<T>(rows: T[], key: (r: T) => string | null, visitor: (r: T) => string, limit: number) {
  const map = new Map<string | null, Set<string>>();
  for (const r of rows) {
    const k = key(r);
    if (!map.has(k)) map.set(k, new Set());
    map.get(k)!.add(visitor(r));
  }
  return [...map.entries()]
    .map(([k, set]) => ({ key: k, n: set.size }))
    .sort((a, b) => b.n - a.n)
    .slice(0, limit);
}

export async function getStats(period: StatsPeriod): Promise<StatsDTO> {
  const { since, unit } = periodStart(period);

  const [rows, leads] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
      select: { id: true, createdAt: true, path: true, visitorId: true, country: true, city: true, device: true, source: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
  ]);

  const visitorOf = (r: (typeof rows)[number]) => r.visitorId;
  const series = countDistinct(rows, (r) => bucketOf(r.createdAt, unit), visitorOf, 1000)
    .sort((a, b) => (a.key! < b.key! ? -1 : 1))
    .map((s) => ({ bucket: s.key!, visitors: s.n }));

  const pageCounts = new Map<string, number>();
  for (const r of rows) pageCounts.set(r.path, (pageCounts.get(r.path) ?? 0) + 1);

  return {
    period,
    visitors: new Set(rows.map(visitorOf)).size,
    pageViews: rows.length,
    leads,
    series,
    countries: countDistinct(rows, (r) => r.country, visitorOf, 12).map((c) => ({ country: c.key, visitors: c.n })),
    devices: countDistinct(rows, (r) => r.device, visitorOf, 3).map((d) => ({ device: d.key ?? "DESKTOP", visitors: d.n })),
    sources: countDistinct(rows, (r) => r.source, visitorOf, 8).map((s) => ({ source: s.key ?? "direct", visitors: s.n })),
    pages: [...pageCounts.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8),
    recent: rows.slice(0, 25).map((r) => ({
      id: String(r.id),
      createdAt: r.createdAt.toISOString(),
      path: r.path,
      country: r.country,
      city: r.city,
      device: r.device,
      source: r.source,
    })),
  };
}


