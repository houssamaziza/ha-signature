import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { createUser, listUsers } from "@/server/services/admin/user.service";
import { createUserSchema } from "@/shared/schemas/admin";

export const GET = withErrors(async (req) => {
  await requireAuth(req, { role: "ADMIN" });
  return ok(await listUsers());
});

export const POST = withErrors(async (req) => {
  await requireAuth(req, { role: "ADMIN" });
  return ok(await createUser(createUserSchema.parse(await readJson(req))), { status: 201 });
});
