import { prisma } from "../db";
import { CONTENT_DEFAULTS, CONTENT_SCHEMAS, type ContentKey, type ContentOf } from "@/shared/schemas/content";

export type ContentResult<K extends ContentKey> = { data: ContentOf<K>; isVisible: boolean };

/**
 * Lit un bloc de contenu. Si le bloc est absent ou invalide (ex. ancien format),
 * on retombe sur la valeur par défaut plutôt que de casser la page.
 */
export async function getContent<K extends ContentKey>(key: K): Promise<ContentResult<K>> {
  const fallback = CONTENT_DEFAULTS[key] as ContentOf<K>;
  const row = await prisma.contentBlock.findUnique({ where: { key } });
  if (!row) return { data: fallback, isVisible: true };

  const parsed = CONTENT_SCHEMAS[key].safeParse(row.data);
  if (!parsed.success) {
    console.warn(`[content] bloc "${key}" invalide, valeur par défaut utilisée`);
    return { data: fallback, isVisible: row.isVisible };
  }
  return { data: parsed.data as ContentOf<K>, isVisible: row.isVisible };
}
