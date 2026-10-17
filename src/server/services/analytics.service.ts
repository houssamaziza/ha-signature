import { prisma } from "../db";
import type { PageViewInput } from "@/shared/schemas/analytics";
import type { Device } from "../http/request-meta";

export type PageViewMeta = {
  country: string | null;
  city: string | null;
  device: Device;
  source: string;
  referrerHost: string | null;
};

/** Enregistre une page vue (sans adresse IP ni paramètres d'URL). */
export async function recordPageView(input: PageViewInput, meta: PageViewMeta): Promise<void> {
  const path = input.path.split(/[?#]/)[0] ?? "/";
  await prisma.pageView.create({
    data: {
      path,
      visitorId: input.visitorId,
      country: meta.country,
      city: meta.city,
      device: meta.device,
      source: meta.source.slice(0, 120),
      referrerHost: meta.referrerHost,
    },
  });
}
