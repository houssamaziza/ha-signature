import { ok, readJson, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { changePassword } from "@/server/services/admin/auth.service";
import { changePasswordSchema } from "@/shared/schemas/admin";

/** POST /api/v1/auth/password — change son mot de passe (déconnecte les autres appareils). */
export const POST = withErrors(async (req) => {
  const { user, sessionId } = await requireAuth(req);
  const input = changePasswordSchema.parse(await readJson(req, 2_000));
  await changePassword(user.id, sessionId, input.currentPassword, input.newPassword);
  return ok({ ok: true });
});
