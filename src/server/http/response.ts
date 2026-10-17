import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

/** Erreur métier avec code HTTP et code stable lisible par les clients (web, mobile). */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (message = "Ressource introuvable.") => new AppError(404, "NOT_FOUND", message);
export const badRequest = (message: string, details?: unknown) => new AppError(400, "BAD_REQUEST", message, details);
export const tooManyRequests = () =>
  new AppError(429, "RATE_LIMITED", "Trop de requêtes. Merci de réessayer dans quelques minutes.");

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data }, init);
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error: { code, message, details } }, { status });
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) return fail(err.status, err.code, err.message, err.details);
  if (err instanceof ZodError) {
    return fail(422, "VALIDATION_ERROR", "Certaines informations sont invalides.", z.flattenError(err).fieldErrors);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return fail(404, "NOT_FOUND", "Élément introuvable.");
    if (err.code === "P2003") return fail(409, "CONFLICT", "Cet élément est lié à d’autres données.");
  }
  if (err instanceof SyntaxError) return fail(400, "INVALID_JSON", "Corps de requête JSON invalide.");
  console.error("[api] erreur inattendue", err);
  return fail(500, "INTERNAL_ERROR", "Une erreur est survenue. Merci de réessayer.");
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Enveloppe un route handler : toute exception devient une réponse JSON propre. */
export function withErrors<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/** Lit le corps JSON avec une taille maximale (protection basique). */
export async function readJson(req: Request, maxBytes = 20_000): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new AppError(413, "PAYLOAD_TOO_LARGE", "Requête trop volumineuse.");
  return JSON.parse(text);
}
