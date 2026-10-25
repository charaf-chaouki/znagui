import { redirect } from "next/navigation";
import { AgenceShell } from "@/components/agence/AgenceShell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";

export const instant = false;

export default async function AgenceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/agence");
  if (user.role !== "AGENCE") redirect("/");

  const locale = await getServerLocale();
  const name = user.agence?.nom ?? user.email ?? "Agence";
  return (
    <LanguageProvider initialLocale={locale}>
      <AgenceShell name={name} role="Agence">
        {children}
      </AgenceShell>
    </LanguageProvider>
  );
}
