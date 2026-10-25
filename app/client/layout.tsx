import { redirect } from "next/navigation";
import { ClientShell } from "@/components/client/ClientShell";
import { getAuthAccount } from "@/lib/auth/current-user";
import { clientGate } from "@/lib/auth/onboarding";
import { homeForRole } from "@/lib/auth/session";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";

export const instant = false;

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthAccount();
  if (!user) redirect("/connexion?next=/client");
  if (user.role !== "CLIENT") redirect(homeForRole(user.role));

  // Clients must finish onboarding and be validated before using their space.
  const gate = clientGate(user.status, user.client);
  if (gate) redirect(gate);

  const locale = await getServerLocale();
  const name = user.client?.nom ?? user.email ?? "Client";
  return (
    <LanguageProvider initialLocale={locale}>
      <ClientShell name={name} role="Client">
        {children}
      </ClientShell>
    </LanguageProvider>
  );
}
