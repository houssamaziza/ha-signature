import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { routeId, type IdCtx } from "@/server/http/params";
import { revalidateSite } from "@/server/revalidate";
import { deleteMedia, updateMedia } from "@/server/services/admin/media.service";
import { updateMediaSchema } from "@/shared/schemas/admin";

export const PATCH = withErrors<IdCtx>(async (req, { params }) => {
  await requireAuth(req);
  const updated = await updateMedia(await routeId(params), updateMediaSchema.parse(await readJson(req)));
  revalidateSite();
  return ok(updated);
});

export const DELETE = withErrors<IdCtx>(async (req, { params }) => {
  await requireAuth(req);
  await deleteMedia(await routeId(params));
  revalidateSite();
  return ok({ ok: true });
});
