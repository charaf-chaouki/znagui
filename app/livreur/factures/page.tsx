import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, ChevronRight, Inbox } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { FactureLivStatutBadge } from "@/components/ui/StatutBadge";
import { listLivreurFactures } from "@/lib/server/facture-livreur.service";
import { formatMAD } from "@/lib/colis-ui";

export const metadata = { title: "Mes factures" };
export const instant = false;

export default async function LivreurFacturesPage() {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/factures");

  const { t, tv } = await getServerT();
  const { rows } = await listLivreurFactures(user.livreur.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">{t("page.mesFactures")}</h1>
      <p className="text-sm text-muted">{tv("livreur.reglements", { n: rows.length })}</p>

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((f) => (
            <Link key={f.id} href={`/livreur/factures/${f.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.99]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-mono text-sm font-bold text-brand-dark">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark"><FileText className="h-4 w-4" /></span>
                  {f.reference}
                </span>
                <FactureLivStatutBadge statut={f.statut} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">{t("livreur.aVerserAgence")}</p>
                  <p className="font-bold text-foreground">{formatMAD(f.montantAVerser)}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span>{tv("livreur.colisCount", { n: f.colisCount })} · {f.date}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-muted">{t("livreur.noFacture")}</p>
        </div>
      )}
    </div>
  );
}
