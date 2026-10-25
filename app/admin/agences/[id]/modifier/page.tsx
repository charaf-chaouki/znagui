import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AgenceForm } from "@/components/agences/AgenceForm";
import { getServerT } from "@/lib/i18n/server";
import { getAgence } from "@/lib/server/agence.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = await getAgence(id);
  return { title: a ? `Modifier ${a.nom}` : "Modifier agence" };
}

export default async function ModifierAgencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getServerT();
  const a = await getAgence(id);
  if (!a) notFound();

  return (
    <div className="space-y-5">
      <Link href={`/admin/agences/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {a.nom}
      </Link>
      <PageHeader title={t("page.modifierAgence")} subtitle={a.nom} />
      <AgenceForm
        mode="edit"
        agenceId={a.id}
        redirectTo={`/admin/agences/${a.id}`}
        initial={{
          nom: a.nom,
          responsable: a.responsable,
          ville: a.ville,
          adresse: a.adresse ?? "",
          telephone: a.telephone ?? "",
          notes: a.notes ?? "",
          locationMap: a.locationMap,
          status: a.status,
          email: a.email,
        }}
      />
    </div>
  );
}
