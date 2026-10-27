import Link from "next/link";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ColisStatutBadge } from "@/components/ui/StatutBadge";
import { formatMAD } from "@/lib/colis-ui";
import { getServerT } from "@/lib/i18n/server";
import type { ClientColisRow } from "@/lib/types/client-portal";

export async function ClientColisTable({ rows, emptyLabel }: { rows: ClientColisRow[]; emptyLabel?: string }) {
  const { t } = await getServerT();
  const cols: Column<ClientColisRow>[] = [
    {
      header: t("col.trk"),
      cell: (c) => (
        <Link href={`/client/colis/${encodeURIComponent(c.trk)}`} className="font-semibold text-brand-dark hover:text-brand">
          {c.trk}
        </Link>
      ),
    },
    {
      header: t("col.destinataire"),
      cell: (c) => (
        <span>
          <span className="block font-medium text-foreground">{c.recipient}</span>
          <span className="block text-xs text-muted">{c.destCity}</span>
        </span>
      ),
    },
    { header: t("col.statut"), cell: (c) => <ColisStatutBadge statut={c.statut} /> },
    { header: t("col.cod"), cell: (c) => <span className="font-medium">{formatMAD(c.cod)}</span>, thClassName: "text-right", className: "text-right" },
    { header: t("col.date"), cell: (c) => <span className="whitespace-nowrap text-muted">{c.date}</span> },
    {
      header: "",
      thClassName: "w-20 text-right",
      className: "text-right",
      // A colis can be edited by the client only while it is still "Créé".
      cell: (c) =>
        c.statut === "CREE" ? (
          <Link
            href={`/client/colis/${encodeURIComponent(c.trk)}/modifier`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand"
          >
            <Pencil className="h-3.5 w-3.5" /> {t("common.edit")}
          </Link>
        ) : null,
    },
  ];
  return <DataTable columns={cols} rows={rows} rowKey={(c) => c.id} emptyLabel={emptyLabel ?? t("empty.colis")} />;
}
