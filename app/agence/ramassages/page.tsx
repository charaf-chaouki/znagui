import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { RamassageStatutBadge } from "@/components/ui/StatutBadge";
import { RamassageToolbar } from "@/components/ramassage/RamassageToolbar";
import { ReceptionScanInput } from "@/components/ramassage/ReceptionScanInput";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listRamassages, PER_PAGE } from "@/lib/server/ramassage.service";
import { prisma } from "@/lib/db";
import type { RamassageRow } from "@/lib/types/ramassage";

export const metadata = { title: "Ramassages" };
export const instant = false;

export default async function AgenceRamassagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/ramassages");

  const { t, tv } = await getServerT();
  const cols: Column<RamassageRow>[] = [
    { header: t("col.reference"), cell: (r) => <Link href={`/agence/ramassages/${r.id}`} className="font-semibold text-brand-dark hover:text-brand">{r.reference}</Link> },
    { header: t("col.livreur"), cell: (r) => r.livreur },
    { header: t("col.colis"), cell: (r) => <span className="font-semibold">{r.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.recus"), cell: (r) => <span className="text-muted">{r.recus}/{r.colisCount}</span>, className: "text-center", thClassName: "text-center" },
    { header: t("col.date"), cell: (r) => <span className="whitespace-nowrap text-muted">{r.date}</span> },
    { header: t("col.statut"), cell: (r) => <RamassageStatutBadge statut={r.statut} /> },
  ];

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [result, livreursRaw] = await Promise.all([
    listRamassages(user.agence.id, { statut: sp.statut, livreurId: sp.livreurId, search: sp.search }, page, PER_PAGE),
    prisma.livreur.findMany({ where: { agenceId: user.agence.id }, select: { id: true, nom: true, prenom: true }, orderBy: { nom: "asc" } }),
  ]);
  const livreurs = livreursRaw.map((l) => ({ id: l.id, nom: `${l.prenom} ${l.nom}` }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.ramassages")}
        subtitle={tv("count.ramassagesPlain", { n: result.total })}
        action={
          <Link href="/agence/ramassages/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> {t("btn.newRamassage")}
          </Link>
        }
      />
      <ReceptionScanInput />
      <RamassageToolbar livreurs={livreurs} />
      <DataTable columns={cols} rows={result.rows} rowKey={(r) => r.id} emptyLabel={t("empty.ramassages")} />
      <Pagination basePath="/agence/ramassages" params={sp} page={result.page} totalPages={result.totalPages} total={result.total} perPage={result.perPage} />
    </div>
  );
}
