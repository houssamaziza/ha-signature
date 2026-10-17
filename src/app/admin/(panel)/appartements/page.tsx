import { ApartmentsManager } from "@/components/admin/ApartmentsManager";
import { PageHeader } from "@/components/admin/ui";
import { listAdminApartments } from "@/server/services/admin/apartment-admin.service";
import { getAdminProject } from "@/server/services/admin/project-admin.service";

export default async function ApartmentsAdminPage() {
  const project = await getAdminProject();
  const apartments = await listAdminApartments(project.id);
  return (
    <>
      <PageHeader title="Appartements" subtitle={`${apartments.length} logements · cliquez sur une ligne pour la modifier`} />
      <div className="p-5 md:p-10">
        <ApartmentsManager apartments={apartments} />
      </div>
    </>
  );
}
