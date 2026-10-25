import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getClient } from "@/lib/server/client.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getClient(id);
  return { title: c ? `Modifier ${c.nom}` : "Modifier client" };
}

export default async function AgenceModifierClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/clients");

  const { id } = await params;
  const { t } = await getServerT();
  const c = await getClient(id);
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <Link href={`/agence/clients/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {c.nom}
      </Link>
      <PageHeader title={t("page.modifierClient")} subtitle={c.nom} />
      <ClientForm
        mode="edit"
        clientId={c.id}
        redirectTo={`/agence/clients/${c.id}`}
        initial={{ nom: c.nom, telephone: c.telephone, cni: c.cni, banque: c.banque ?? "", rib: c.rib ?? "", cniRectoFile: c.cniRectoFile, cniVersoFile: c.cniVersoFile, ribFile: c.ribFile, ville: c.ville ?? "", adresse: c.adresse ?? "", status: c.status, email: c.email }}
      />
    </div>
  );
}
