import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike, ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listLivreurDispatches } from "@/lib/server/expedition-livreur.service";
import { EXP_LIV_STATUT_LABEL, EXP_LIV_STATUT_TONE } from "@/lib/expedition-livreur-ui";

export const metadata = { title: "Expéditions" };
export const instant = false;

export default async function LivreurExpeditionsPage() {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/expeditions");

  const rows = await listLivreurDispatches(user.livreur.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Expéditions reçues</h1>
      <p className="text-sm text-muted">{rows.length} dispatch{rows.length > 1 ? "s" : ""} à réceptionner / livrer</p>

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((e) => (
            <Link key={e.id} href={`/livreur/expeditions/${e.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.99]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-mono text-sm font-bold text-brand-dark">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark"><Bike className="h-4 w-4" /></span>
                  {e.reference}
                </span>
                <Badge tone={EXP_LIV_STATUT_TONE[e.statut]}>{EXP_LIV_STATUT_LABEL[e.statut]}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-muted">{e.agence} · {e.date}</span>
                <span className="flex items-center gap-2 font-medium text-foreground">{e.colisCount} colis <ChevronRight className="h-4 w-4 text-slate-400" /></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-muted">Aucun dispatch à réceptionner.</p>
        </div>
      )}
    </div>
  );
}
