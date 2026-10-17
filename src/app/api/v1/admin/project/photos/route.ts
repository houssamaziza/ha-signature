import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { revalidateSite } from "@/server/revalidate";
import { addProgressPhoto, getAdminProject } from "@/server/services/admin/project-admin.service";
import { createProgressPhotoSchema } from "@/shared/schemas/admin";

/** POST /api/v1/admin/project/photos — { mediaId, takenAt, caption } */
export const POST = withErrors(async (req) => {
  await requireAuth(req);
  const project = await getAdminProject();
  const photo = await addProgressPhoto(project.id, createProgressPhotoSchema.parse(await readJson(req)));
  revalidateSite();
  return ok(photo, { status: 201 });
});
