import { withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { exportLeadsCsv } from "@/server/services/admin/lead-admin.service";

/** GET /api/v1/admin/leads/export — fichier CSV ouvrable dans Excel. */
export const GET = withErrors(async (req) => {
  await requireAuth(req);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(await exportLeadsCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
