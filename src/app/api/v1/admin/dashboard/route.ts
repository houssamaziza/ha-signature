import { ok, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { getDashboard } from "@/server/services/admin/dashboard.service";

export const GET = withErrors(async (req) => {
  await requireAuth(req);
  return ok(await getDashboard());
});
