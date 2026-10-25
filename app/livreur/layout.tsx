import { redirect } from "next/navigation";
import { LivreurShell } from "@/components/livreur/LivreurShell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";

export const instant = false;

export default async function LivreurLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/livreur");
  if (user.role !== "LIVREUR") redirect("/");

  const locale = await getServerLocale();
  return (
    <LanguageProvider initialLocale={locale}>
      <LivreurShell>{children}</LivreurShell>
    </LanguageProvider>
  );
}
