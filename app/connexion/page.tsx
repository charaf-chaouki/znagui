import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getServerT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Znagui Express.",
};

export const instant = false;

export default async function ConnexionPage() {
  const { t } = await getServerT();
  return (
    <AuthShell title={t("auth.loginTitle")} subtitle={t("auth.loginSub")}>
      <LoginForm />
    </AuthShell>
  );
}
