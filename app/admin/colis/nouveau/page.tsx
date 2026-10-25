import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ColisForm } from "@/components/colis/ColisForm";
import { getServerT } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";

export const metadata = { title: "Nouveau colis" };
export const instant = false;

export default async function NouveauColisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { t } = await getServerT();
  const { client } = await searchParams;
  const clients = await prisma.client.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });
  const initial = client && clients.some((c) => c.id === client) ? { clientId: client } : undefined;

  return (
    <div className="space-y-5">
      <Link href="/admin/colis" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.colis")}
      </Link>
      <PageHeader title={t("btn.addColis")} subtitle={t("page.nouveauColis.sub")} />
      <ColisForm clients={clients} mode="create" initial={initial} allowManualTarif />
    </div>
  );
}
