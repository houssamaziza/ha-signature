import { prisma } from "../../db";
import { CONTENT_SCHEMAS, type ContentKey } from "@/shared/schemas/content";
import { getContent } from "../content.service";

export function isContentKey(key: string): key is ContentKey {
  return key in CONTENT_SCHEMAS;
}

export { getContent };

export async function saveContent(key: ContentKey, data: unknown, isVisible: boolean | undefined) {
  const parsed = CONTENT_SCHEMAS[key].parse(data); // lève ZodError → 422
  const row = await prisma.contentBlock.upsert({
    where: { key },
    update: { data: parsed, ...(isVisible === undefined ? {} : { isVisible }) },
    create: { key, data: parsed, isVisible: isVisible ?? true },
  });
  return { data: parsed, isVisible: row.isVisible };
}
