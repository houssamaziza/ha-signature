import { notFound, ok, withErrors } from "@/server/http/response";
import { getProjectBySlug } from "@/server/services/project.service";

type Ctx = { params: Promise<{ slug: string }> };

/** GET /api/v1/projects/:slug — programme avec logements, étapes et photos du chantier. */
export const GET = withErrors<Ctx>(async (_req, { params }) => {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) throw notFound("Programme introuvable.");
  return ok(project, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
});
