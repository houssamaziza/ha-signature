import { ok, readJson, tooManyRequests, withErrors } from "@/server/http/response";
import { rateLimit } from "@/server/http/rate-limit";
import { clientKey } from "@/server/http/request-meta";
import { confirmPasswordReset } from "@/server/services/admin/password-reset.service";
import { resetConfirmSchema } from "@/shared/schemas/admin";

/** POST /api/v1/auth/password-reset/confirm — { token, newPassword } */
export const POST = withErrors(async (req) => {
  if (!rateLimit(`reset-confirm:${clientKey(req.headers)}`, 10, 15 * 60_000)) throw tooManyRequests();
  const { token, newPassword } = resetConfirmSchema.parse(await readJson(req, 1_000));
  await confirmPasswordReset(token, newPassword);
  return ok({ ok: true });
});
