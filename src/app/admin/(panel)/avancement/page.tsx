import { ProgressManager } from "@/components/admin/ProgressManager";
import { PageHeader } from "@/components/admin/ui";
import { toFeatures } from "@/shared/features";
import { getAdminProject } from "@/server/services/admin/project-admin.service";

export default async function ProgressAdminPage() {
  const p = await getAdminProject();
  return (
    <>
      <PageHeader title="Avancement du chantier" subtitle="Ce que vous modifiez ici s’affiche sur la page Avancement." />
      <div className="p-5 md:p-10">
        <ProgressManager
          currentPhaseOrder={p.currentPhaseOrder}
          deliveryLabel={p.deliveryLabel}
          features={toFeatures(p.features)}
          phases={p.phases.map((ph) => ({ order: ph.order, name: ph.name }))}
          photos={p.progressPhotos.map((ph) => ({ id: ph.id, takenAt: ph.takenAt.toISOString(), caption: ph.caption, url: ph.media.url, alt: ph.media.alt }))}
        />
      </div>
    </>
  );
}
