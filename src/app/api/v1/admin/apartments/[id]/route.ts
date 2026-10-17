import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { routeId, type IdCtx } from "@/server/http/params";
import { revalidateSite } from "@/server/revalidate";
import { updateApartment } from "@/server/services/admin/apartment-admin.service";
import { updateApartmentSchema } from "@/shared/schemas/admin";

/** PATCH /api/v1/admin/apartments/:id — prix, statut, plan, visibilité… */
export const PATCH = withErrors<IdCtx>(async (req, { params }) => {
  await requireAuth(req);
  const updated = await updateApartment(await routeId(params), updateApartmentSchema.parse(await readJson(req)));
  revalidateSite();
  return ok(updated);
});
