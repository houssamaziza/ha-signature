import { ok, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { getStats } from "@/server/services/admin/stats.service";
import { statsQuerySchema } from "@/shared/schemas/admin";

/** GET /api/v1/admin/stats?period=today|7d|30d|12m */
export const GET = withErrors(async (req) => {
  await requireAuth(req);
  const { period } = statsQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return ok(await getStats(period));
});
