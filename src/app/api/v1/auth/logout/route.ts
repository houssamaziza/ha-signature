import { NextResponse } from "next/server";
import { withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";
import { SESSION_COOKIE, deleteSession } from "@/server/auth/session";

/** POST /api/v1/auth/logout — supprime la session courante (web ou mobile). */
export const POST = withErrors(async (req) => {
  const { token } = await requireAuth(req);
  await deleteSession(token);
  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.delete(SESSION_COOKIE);
  return res;
});
