import { ok, withErrors } from "@/server/http/response";
import { requireAuth } from "@/server/auth/guard";

/** GET /api/v1/auth/me — utilisateur connecté. */
export const GET = withErrors(async (req) => ok((await requireAuth(req)).user));
