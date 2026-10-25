import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte client Znagui Express en quelques secondes.",
};

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Inscrivez-vous gratuitement pour envoyer et suivre vos colis."
      panelHeading={<>Rejoignez<br />Znagui Express</>}
      panelText="Créez votre compte client en quelques secondes et commencez à expédier partout au Maroc."
    >
      <RegisterForm />
    </AuthShell>
  );
}
