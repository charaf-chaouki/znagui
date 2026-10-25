import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisForm } from "@/components/colis/ColisForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listAgenceClients } from "@/lib/server/agence-colis.service";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau colis" };
export const instant = false;

export default async function AgenceNouveauColisPage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/colis/nouveau");

  const { t } = await getServerT();
  const [clients, ville, agence] = await Promise.all([
    listAgenceClients(),
    prisma.ville.findUnique({ where: { id: user.agence.villeId }, select: { nom: true } }),
    prisma.agence.findUnique({ where: { id: user.agence.id }, select: { adresse: true } }),
  ]);
  const fixedPickup = { city: ville?.nom ?? "", address: agence?.adresse?.trim() || "" };

  return (
    <div className="space-y-5">
      <Link href="/agence/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.colis")}
      </Link>
      <PageHeader title={t("btn.addColis")} subtitle={t("page.agenceNouveauColis.sub")} />
      <ColisForm
        clients={clients}
        mode="create"
        apiBase="/api/agence/colis"
        detailPathBase="/agence/colis"
        allowManualTarif
        depotMode
        allowNewClient
        fixedPickup={fixedPickup}
      />
    </div>
  );
}
