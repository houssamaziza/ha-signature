import { z } from "zod";
import { badRequest, ok, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { listMedia, uploadMedia } from "@/server/services/admin/media.service";
import { MEDIA_CATEGORIES } from "@/shared/schemas/admin";

const category = z.enum(MEDIA_CATEGORIES);

/** GET /api/v1/admin/media?category=PLAN */
export const GET = withErrors(async (req) => {
  await requireAuth(req);
  const raw = new URL(req.url).searchParams.get("category");
  return ok(await listMedia(raw ? category.parse(raw) : undefined));
});

/** POST /api/v1/admin/media — multipart : file, alt, category */
export const POST = withErrors(async (req) => {
  await requireAuth(req);
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("Aucun fichier reçu.");
  const media = await uploadMedia(file, String(form.get("alt") ?? ""), category.catch("OTHER").parse(form.get("category")));
  return ok(media, { status: 201 });
});
