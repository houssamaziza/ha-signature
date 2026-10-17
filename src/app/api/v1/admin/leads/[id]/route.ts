import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { routeId, type IdCtx } from "@/server/http/params";
import { updateLeadStatus } from "@/server/services/admin/lead-admin.service";
import { updateLeadSchema } from "@/shared/schemas/admin";

export const PATCH = withErrors<IdCtx>(async (req, { params }) => {
  await requireAuth(req);
  const { status } = updateLeadSchema.parse(await readJson(req));
  return ok(await updateLeadStatus(await routeId(params), status));
});
