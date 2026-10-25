import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getAuthAccount } from "@/lib/auth/current-user";
import { clientGate, isClientOnboarded } from "@/lib/auth/onboarding";
import { getServerT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Compléter mon profil" };
export const instant = false;

export default async function OnboardingPage() {
  const account = await getAuthAccount();
  // The layout already guarantees a CLIENT session; narrow for TypeScript.
  if (!account?.client) redirect("/connexion?next=/onboarding");

  // Already onboarded → move on (pending validation or full access).
  if (isClientOnboarded(account.client)) {
    redirect(clientGate(account.status, account.client) ?? "/client");
  }

  const { t, tv } = await getServerT();
  const c = account.client;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">{tv("onb.welcome", { name: c.nom })}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground">{t("onb.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("onb.subtitle")}</p>
      </div>

      <OnboardingForm
        initial={{
          cni: c.cni ?? "",
          banque: c.banque ?? "",
          rib: c.rib ?? "",
          cniRectoFile: c.cniRectoFile,
          cniVersoFile: c.cniVersoFile,
          ribFile: c.ribFile,
        }}
      />
    </div>
  );
}
