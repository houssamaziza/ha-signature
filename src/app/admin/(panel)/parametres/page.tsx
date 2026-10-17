import { LegalForm, PasswordForm, SettingsForm, UsersManager } from "@/components/admin/SettingsForms";
import { PageHeader } from "@/components/admin/ui";
import { requirePageUser } from "@/server/auth/current-user";
import { getAdminSettings } from "@/server/services/admin/settings-admin.service";
import { listUsers } from "@/server/services/admin/user.service";

export default async function SettingsPage() {
  const user = await requirePageUser();
  const isAdmin = user.role === "ADMIN";
  const [settings, users] = await Promise.all([getAdminSettings(), isAdmin ? listUsers() : Promise.resolve([])]);
  const { legal, ...values } = settings;
  return (
    <>
      <PageHeader title="Paramètres" subtitle="Coordonnées, identité, mentions légales et accès" />
      <div className="grid items-start gap-6 p-5 md:p-10 2xl:grid-cols-2">
        <SettingsForm initial={values} canEdit={isAdmin} />
        <div className="flex flex-col gap-6">
          <LegalForm initial={legal} canEdit={isAdmin} />
          <PasswordForm />
          {isAdmin && <UsersManager users={users} currentUserId={user.id} />}
        </div>
      </div>
    </>
  );
}
