import { z } from "zod";
import { notFound, ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { revalidateSite } from "@/server/revalidate";
import { getContent, isContentKey, saveContent } from "@/server/services/admin/content-admin.service";

type Ctx = { params: Promise<{ key: string }> };
const bodySchema = z.object({ data: z.unknown(), isVisible: z.boolean().optional() });

async function resolveKey(params: Ctx["params"]) {
  const { key } = await params;
  if (!isContentKey(key)) throw notFound("Bloc de contenu inconnu.");
  return key;
}

/** GET /api/v1/admin/content/:key */
export const GET = withErrors<Ctx>(async (req, { params }) => {
  await requireAuth(req);
  return ok(await getContent(await resolveKey(params)));
});

/** PUT /api/v1/admin/content/:key — { data, isVisible? } validé par le schéma du bloc. */
export const PUT = withErrors<Ctx>(async (req, { params }) => {
  await requireAuth(req);
  const key = await resolveKey(params);
  const body = bodySchema.parse(await readJson(req, 50_000));
  const saved = await saveContent(key, body.data, body.isVisible);
  revalidateSite();
  return ok(saved);
});
