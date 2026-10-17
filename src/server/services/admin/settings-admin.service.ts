import { z } from "zod";
import { prisma } from "../../db";
import { DEFAULT_SETTINGS } from "@/shared/defaults";
import { legalInfoSchema } from "@/shared/schemas/legal";
import type { updateSettingsSchema } from "@/shared/schemas/admin";

export async function getAdminSettings() {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const base = row ?? { ...DEFAULT_SETTINGS, legal: {} };
  const legal = legalInfoSchema.safeParse(base.legal);
  const { siteName, tagline, accentColor, phone, whatsappNumber, whatsappMessage, email, officeAddress, seoTitle, seoDescription } = base;
  return {
    siteName, tagline, accentColor, phone, whatsappNumber, whatsappMessage, email, officeAddress, seoTitle, seoDescription,
    legal: legal.success ? legal.data : {},
  };
}

export async function updateSettings(input: z.infer<typeof updateSettingsSchema>) {
  const current = await getAdminSettings();
  const next = { ...current, ...input, legal: { ...current.legal, ...(input.legal ?? {}) } };
  await prisma.siteSettings.upsert({ where: { id: 1 }, update: next, create: { id: 1, ...next } });
  return next;
}
