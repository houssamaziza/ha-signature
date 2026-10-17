import { prisma } from "../db";
import type { CreateLead } from "@/shared/schemas/lead";

export type LeadContext = {
  projectSlug: string;
  country: string | null;
  source: "website" | "mobile-app";
};

/** Enregistre une demande de contact. Les données sont déjà validées par Zod. */
export async function createLead(input: CreateLead, ctx: LeadContext): Promise<{ id: number }> {
  let apartmentId: number | undefined;
  if (input.apartmentNumber) {
    const apartment = await prisma.apartment.findFirst({
      where: { number: input.apartmentNumber, project: { slug: ctx.projectSlug } },
      select: { id: true },
    });
    apartmentId = apartment?.id;
  }

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message || null,
      apartmentId,
      consentAt: new Date(),
      source: ctx.source,
      country: ctx.country,
    },
  });

  return { id: lead.id };
}
