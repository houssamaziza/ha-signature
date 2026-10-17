import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { routeId, type IdCtx } from "@/server/http/params";
import { updateUser } from "@/server/services/admin/user.service";
import { updateUserSchema } from "@/shared/schemas/admin";

/** PATCH /api/v1/admin/users/:id — nom, rôle, activation (désactiver = déconnexion immédiate). */
export const PATCH = withErrors<IdCtx>(async (req, { params }) => {
  const { user } = await requireAuth(req, { role: "ADMIN" });
  return ok(await updateUser(user.id, await routeId(params), updateUserSchema.parse(await readJson(req))));
});
