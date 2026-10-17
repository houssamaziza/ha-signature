import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { routeId, type IdCtx } from "@/server/http/params";
import { revalidateSite } from "@/server/revalidate";
import { deleteProgressPhoto, updateProgressPhoto } from "@/server/services/admin/project-admin.service";
import { updateProgressPhotoSchema } from "@/shared/schemas/admin";

export const PATCH = withErrors<IdCtx>(async (req, { params }) => {
  await requireAuth(req);
  const updated = await updateProgressPhoto(await routeId(params), updateProgressPhotoSchema.parse(await readJson(req)));
  revalidateSite();
  return ok(updated);
});

export const DELETE = withErrors<IdCtx>(async (req, { params }) => {
  await requireAuth(req);
  await deleteProgressPhoto(await routeId(params));
  revalidateSite();
  return ok({ ok: true });
});
