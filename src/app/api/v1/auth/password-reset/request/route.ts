import { after } from "next/server";
import { ok, readJson, tooManyRequests, withErrors } from "@/server/http/response";
import { rateLimit } from "@/server/http/rate-limit";
import { clientKey } from "@/server/http/request-meta";
import { requestPasswordReset } from "@/server/services/admin/password-reset.service";
import { resetRequestSchema } from "@/shared/schemas/admin";

/** POST /api/v1/auth/password-reset/request — réponse identique que l'e-mail existe ou non. */
export const POST = withErrors(async (req) => {
  if (!rateLimit(`reset:${clientKey(req.headers)}`, 5, 15 * 60_000)) throw tooManyRequests();
  const { email } = resetRequestSchema.parse(await readJson(req, 1_000));
  after(() => requestPasswordReset(email).catch((e) => console.error("[reset] envoi impossible", e)));
  return ok({ ok: true });
});
