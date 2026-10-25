import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { PendingRefresh } from "@/components/onboarding/PendingRefresh";
import { getAuthAccount } from "@/lib/auth/current-user";
import { isClientOnboarded } from "@/lib/auth/onboarding";
import { getServerT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Compte en cours de validation" };
export const instant = false;

export default async function OnboardingPendingPage() {
  const account = await getAuthAccount();
  if (!account?.client) redirect("/connexion?next=/onboarding");

  // Not onboarded yet → back to the form.
  if (!isClientOnboarded(account.client)) redirect("/onboarding");
  // Already validated → full access.
  if (account.status === "ACTIVE") redirect("/client");

  const { t } = await getServerT();

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Clock className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-xl font-extrabold text-foreground">{t("onb.pendingTitle")}</h1>
      <p className="mt-3 text-sm text-muted">{t("onb.pendingMessage")}</p>
      <p className="mt-2 text-sm text-muted">{t("onb.pendingHint")}</p>
      <div className="mt-6 flex justify-center">
        <PendingRefresh />
      </div>
    </div>
  );
}
