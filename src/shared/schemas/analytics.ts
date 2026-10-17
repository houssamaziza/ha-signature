import { z } from "zod";

/** Page vue envoyée par le navigateur (uniquement après consentement). */
export const pageViewSchema = z.object({
  path: z.string().trim().startsWith("/").max(300),
  referrer: z.string().trim().max(500).optional(),
  visitorId: z.string().trim().regex(/^[a-zA-Z0-9-]{8,64}$/),
  utmSource: z.string().trim().max(80).optional(),
});

export type PageViewInput = z.infer<typeof pageViewSchema>;
