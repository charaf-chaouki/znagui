import { redirect } from "next/navigation";
import { AdminShell } from "@/components/dashboard/AdminShell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  const locale = await getServerLocale();
  const name = user.agence?.nom ?? user.email ?? "Administrateur";
  return (
    <LanguageProvider initialLocale={locale}>
      <AdminShell name={name} role="Administrateur">
        {children}
      </AdminShell>
    </LanguageProvider>
  );
}
