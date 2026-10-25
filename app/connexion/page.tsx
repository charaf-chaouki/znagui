import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Znagui Express.",
};

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace client, livreur, agence ou admin."
    >
      <LoginForm />
    </AuthShell>
  );
}
