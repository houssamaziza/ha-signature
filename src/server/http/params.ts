import { z } from "zod";

const idSchema = z.coerce.number().int().positive();

/** Lit un identifiant numérique de route (/:id). */
export async function routeId(params: Promise<{ id: string }>): Promise<number> {
  return idSchema.parse((await params).id);
}

export type IdCtx = { params: Promise<{ id: string }> };
