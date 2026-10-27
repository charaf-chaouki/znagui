import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte client Znagui Express en quelques secondes.",
};

export const instant = false;

export default async function InscriptionPage() {
  const { t } = await getServerT();
  return (
    <AuthShell
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSub")}
      panelHeading={t("auth.registerPanelHeading")}
      panelText={t("auth.registerPanelText")}
    >
      <RegisterForm />
    </AuthShell>
  );
}
