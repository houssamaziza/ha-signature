import { NextResponse } from "next/server";
import { readJson, tooManyRequests, withErrors } from "@/server/http/response";
import { rateLimit } from "@/server/http/rate-limit";
import { clientKey } from "@/server/http/request-meta";
import { SESSION_COOKIE } from "@/server/auth/session";
import { login } from "@/server/services/admin/auth.service";
import { loginSchema } from "@/shared/schemas/admin";

/**
 * POST /api/v1/auth/login
 * Web : pose le cookie de session. Mobile (`X-Client: mobile-app`) : renvoie le jeton.
 */
export const POST = withErrors(async (req) => {
  if (!rateLimit(`login:${clientKey(req.headers)}`, 8, 15 * 60_000)) throw tooManyRequests();
  const { email, password } = loginSchema.parse(await readJson(req, 2_000));
  const mobile = req.headers.get("x-client") === "mobile-app";
  const result = await login(email, password, mobile ? "mobile" : "web", req.headers.get("user-agent"));

  if (mobile) {
    return NextResponse.json({ data: { user: result.user, token: result.token, expiresAt: result.expiresAt.toISOString() } });
  }
  const res = NextResponse.json({ data: { user: result.user } });
  res.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: result.expiresAt,
  });
  return res;
});
