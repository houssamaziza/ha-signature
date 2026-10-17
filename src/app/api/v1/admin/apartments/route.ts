import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { revalidateSite } from "@/server/revalidate";
import { createApartment, listAdminApartments } from "@/server/services/admin/apartment-admin.service";
import { getAdminProject } from "@/server/services/admin/project-admin.service";
import { createApartmentSchema } from "@/shared/schemas/admin";

export const GET = withErrors(async (req) => {
  await requireAuth(req);
  const project = await getAdminProject();
  return ok(await listAdminApartments(project.id));
});

export const POST = withErrors(async (req) => {
  await requireAuth(req);
  const project = await getAdminProject();
  const created = await createApartment(project.id, createApartmentSchema.parse(await readJson(req)));
  revalidateSite();
  return ok(created, { status: 201 });
});
