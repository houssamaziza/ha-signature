import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";
import { listMedia } from "@/server/services/admin/media.service";

export default async function MediaPage() {
  const media = await listMedia();
  return (
    <>
      <PageHeader title="Médias" subtitle="Toutes les photos et tous les plans du site" />
      <div className="p-5 md:p-10"><MediaLibrary media={media} /></div>
    </>
  );
}
