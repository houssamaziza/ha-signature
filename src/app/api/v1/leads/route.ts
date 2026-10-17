import { after } from "next/server";
import { notifyNewLead } from "@/server/notifications/notifier";
import { ok, readJson, tooManyRequests, withErrors } from "@/server/http/response";
import { rateLimit } from "@/server/http/rate-limit";
import { clientKey, getCountry } from "@/server/http/request-meta";
import { createLead } from "@/server/services/lead.service";
import { getDefaultProjectSlug } from "@/server/services/project.service";
import { createLeadSchema } from "@/shared/schemas/lead";

/**
 * POST /api/v1/leads — nouvelle demande de contact.
 * En-tête facultatif `X-Client: mobile-app` pour les demandes venant de l'application.
 */
export const POST = withErrors(async (req) => {
  const headers = req.headers;
  if (!rateLimit(`lead:${clientKey(headers)}`, 5, 10 * 60_000)) throw tooManyRequests();

  const body = await readJson(req);

  // Champ piège rempli : on répond comme si tout allait bien, sans rien enregistrer.
  if (body && typeof body === "object" && "website" in body && (body as { website?: unknown }).website) {
    return ok({ id: 0 }, { status: 201 });
  }

  const input = createLeadSchema.parse(body);
  const result = await createLead(input, {
    projectSlug: getDefaultProjectSlug(),
    country: getCountry(headers),
    source: headers.get("x-client") === "mobile-app" ? "mobile-app" : "website",
  });
  // E-mail envoyé après la réponse : ne retarde ni ne fait échouer l'envoi du formulaire.
  after(() => notifyNewLead(result.id));
  return ok(result, { status: 201 });
});
