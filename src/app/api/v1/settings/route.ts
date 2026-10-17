import { ok, withErrors } from "@/server/http/response";
import { getPublicSettings } from "@/server/services/settings.service";

/** GET /api/v1/settings — coordonnées et identité publiques du site. */
export const GET = withErrors(async () => {
  return ok(await getPublicSettings(), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
});
