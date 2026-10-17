import { readUpload } from "@/server/storage/files";

type Ctx = { params: Promise<{ file: string }> };

/** GET /media/:file — fichiers envoyés depuis l'administration. */
export async function GET(_req: Request, { params }: Ctx) {
  const { file } = await params;
  const upload = await readUpload(file);
  if (!upload) return new Response("Introuvable", { status: 404 });
  return new Response(upload.data, {
    headers: {
      "Content-Type": upload.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(upload.mimeType === "application/pdf" ? { "Content-Disposition": `inline; filename="${file}"` } : {}),
    },
  });
}
