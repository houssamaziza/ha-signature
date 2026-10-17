import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requirePageUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db";

/** Toutes les pages de l'administration exigent une session valide. */
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const newLeads = await prisma.lead.count({ where: { status: "NEW" } });
  return (
    <div className="lg:flex">
      <AdminSidebar userName={user.name} role={user.role} newLeads={newLeads} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
