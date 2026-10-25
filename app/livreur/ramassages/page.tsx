import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageCheck, ChevronRight, Inbox } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { RamassageStatutBadge } from "@/components/ui/StatutBadge";
import { listLivreurRamassages } from "@/lib/server/ramassage.service";

export const metadata = { title: "Ramassages" };
export const instant = false;

export default async function LivreurRamassagesPage() {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/ramassages");

  const { t, tv } = await getServerT();
  const rows = await listLivreurRamassages(user.livreur.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">{t("nav.ramassages")}</h1>
      <p className="text-sm text-muted">{tv("livreur.missions", { n: rows.length })}</p>

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link key={r.id} href={`/livreur/ramassages/${r.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.99]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-mono text-sm font-bold text-brand-dark">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark"><PackageCheck className="h-4 w-4" /></span>
                  {r.reference}
                </span>
                <RamassageStatutBadge statut={r.statut} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-muted">{r.agence} · {r.date}</span>
                <span className="flex items-center gap-2 font-medium text-foreground">{tv("livreur.ramasses", { n: `${r.ramasses}/${r.total}` })} <ChevronRight className="h-4 w-4 text-slate-400" /></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-muted">{t("livreur.noRamAssigned2")}</p>
        </div>
      )}
    </div>
  );
}
