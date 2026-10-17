import { z } from "zod";
import { ok, withErrors } from "@/server/http/response";
import { getDefaultProjectSlug, listApartments } from "@/server/services/project.service";
import { APARTMENT_STATUSES, APARTMENT_VIEWS } from "@/shared/constants";

const querySchema = z.object({
  project: z.string().trim().min(1).max(80).optional(),
  status: z.enum(APARTMENT_STATUSES).optional(),
  view: z.enum(APARTMENT_VIEWS).optional(),
});

/** GET /api/v1/apartments?project=la-caroube-2&status=AVAILABLE&view=SEA */
export const GET = withErrors(async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const query = querySchema.parse(params);
  const apartments = await listApartments({
    projectSlug: query.project ?? getDefaultProjectSlug(),
    status: query.status,
    view: query.view,
  });
  return ok(apartments, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
});
