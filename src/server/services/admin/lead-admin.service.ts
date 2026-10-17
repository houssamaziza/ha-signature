import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "../../db";
import type { LeadDTO, Paginated } from "@/shared/types/admin";
import { apartmentShortLabel } from "@/shared/apartments";

const include = { apartment: { select: { id: true, number: true, type: true, floor: true, view: true, surfaceM2: true } } } as const;
type Row = Prisma.LeadGetPayload<{ include: typeof include }>;

function toDTO(l: Row): LeadDTO {
  return {
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    message: l.message,
    apartment: l.apartment ? { id: l.apartment.id, number: l.apartment.number, label: apartmentShortLabel(l.apartment) } : null,
    status: l.status,
    source: l.source,
    country: l.country,
    createdAt: l.createdAt.toISOString(),
  };
}

export async function listLeads(q: { status?: LeadStatus; page: number; pageSize: number }): Promise<Paginated<LeadDTO>> {
  const where = q.status ? { status: q.status } : { status: { not: "ARCHIVED" as const } };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where, include, orderBy: { createdAt: "desc" }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
    prisma.lead.count({ where }),
  ]);
  return { items: items.map(toDTO), total, page: q.page, pageSize: q.pageSize };
}

export async function countLeadsByStatus() {
  const rows = await prisma.lead.groupBy({ by: ["status"], _count: { _all: true } });
  return Object.fromEntries(rows.map((r) => [r.status, r._count._all])) as Partial<Record<LeadStatus, number>>;
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  return toDTO(await prisma.lead.update({ where: { id }, data: { status }, include }));
}

/** Export CSV (séparateur « ; » pour Excel en français, BOM UTF-8). */
export async function exportLeadsCsv(): Promise<string> {
  const rows = await prisma.lead.findMany({ include, orderBy: { createdAt: "desc" } });
  const esc = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Date", "Nom", "Téléphone", "E-mail", "Appartement", "Message", "Statut", "Pays", "Source"];
  const lines = rows.map((r) => {
    const d = toDTO(r);
    return [d.createdAt, d.name, d.phone, d.email, d.apartment?.label, d.message, d.status, d.country, d.source].map(esc).join(";");
  });
  return "\uFEFF" + [header.map(esc).join(";"), ...lines].join("\r\n");
}
