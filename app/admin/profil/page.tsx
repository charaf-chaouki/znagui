import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";

export const metadata = { title: "Mon profil" };
export const instant = false;

export default async function AdminProfilPage() {
  const user = await getCurrentUser();
  // The admin layout already guarantees an ADMIN session; narrow for TypeScript.
  if (!user) redirect("/connexion?next=/admin/profil");

  const { t } = await getServerT();

  return (
    <div className="space-y-5">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />
      <AdminProfile email={user.email ?? "—"} phone={user.phone ?? "—"} />
    </div>
  );
}
