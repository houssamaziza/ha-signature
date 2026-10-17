import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { revalidateSite } from "@/server/revalidate";
import { getAdminProject, updateProject } from "@/server/services/admin/project-admin.service";
import { updateProjectSchema } from "@/shared/schemas/admin";

/** GET /api/v1/admin/project — programme courant avec étapes et photos. */
export const GET = withErrors(async (req) => {
  await requireAuth(req);
  return ok(await getAdminProject());
});

/** PATCH /api/v1/admin/project — étape en cours, date de livraison, atouts, photo principale. */
export const PATCH = withErrors(async (req) => {
  await requireAuth(req);
  const project = await getAdminProject();
  const updated = await updateProject(project.id, updateProjectSchema.parse(await readJson(req)));
  revalidateSite();
  return ok(updated);
});
