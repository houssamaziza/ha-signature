import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { revalidateSite } from "@/server/revalidate";
import { getAdminSettings, updateSettings } from "@/server/services/admin/settings-admin.service";
import { updateSettingsSchema } from "@/shared/schemas/admin";

export const GET = withErrors(async (req) => {
  await requireAuth(req);
  return ok(await getAdminSettings());
});

/** PUT /api/v1/admin/settings — coordonnées, identité, SEO, informations légales (partiel). */
export const PUT = withErrors(async (req) => {
  await requireAuth(req, { role: "ADMIN" });
  const saved = await updateSettings(updateSettingsSchema.parse(await readJson(req, 30_000)));
  revalidateSite();
  return ok(saved);
});
