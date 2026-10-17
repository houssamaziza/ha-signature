import { ok, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { listLeads } from "@/server/services/admin/lead-admin.service";
import { leadQuerySchema } from "@/shared/schemas/admin";

/** GET /api/v1/admin/leads?status=NEW&page=1 */
export const GET = withErrors(async (req) => {
  await requireAuth(req);
  return ok(await listLeads(leadQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams))));
});
