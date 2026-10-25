import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau client" };
export const instant = false;

export default async function AgenceNouveauClientPage() {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/clients/nouveau");

  const { t } = await getServerT();
  const agence = await prisma.agence.findUnique({ where: { id: user.agence.id }, select: { ville: { select: { nom: true } } } });

  return (
    <div className="space-y-5">
      <Link href="/agence/clients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.clients")}
      </Link>
      <PageHeader title={t("btn.newClient")} subtitle={t("page.nouveauClient.subAgence")} />
      <ClientForm mode="create" redirectTo="/agence/clients" initial={{ ville: agence?.ville.nom }} />
    </div>
  );
}
