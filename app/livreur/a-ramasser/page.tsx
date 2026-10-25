import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Inbox, QrCode, Sparkles } from "lucide-react";
import { ParcelCard } from "@/components/livreur/ParcelCard";
import { AvailableColisCard } from "@/components/livreur/AvailableColisCard";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { listLivreurARamasser, listAvailableIntraColis } from "@/lib/server/livreur-portal.service";

export const metadata = { title: "À ramasser" };
export const instant = false;

export default async function LivreurARamasserPage() {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/a-ramasser");

  const { t } = await getServerT();
  const [mine, available] = await Promise.all([
    listLivreurARamasser(user.livreur.id),
    listAvailableIntraColis(user.livreur.id),
  ]);

  return (
    <div className="space-y-5">
      <Link href="/livreur" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.accueil")}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t("nav.aRamasser")}</h1>
        <Link href="/livreur/scan" className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast active:scale-95">
          <QrCode className="h-4 w-4" /> {t("livreur.scanner")}
        </Link>
      </div>

      {/* Disponibles — same-ville colis to grab */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <h2 className="font-bold text-foreground">{t("livreur.disponiblesVille")}</h2>
          <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-darker">{available.length}</span>
        </div>
        {available.length > 0 ? (
          <div className="space-y-3">{available.map((c) => <AvailableColisCard key={c.id} c={c} />)}</div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-muted">
            {t("livreur.noDispo")}
          </p>
        )}
      </section>

      {/* Mine — assigned pickups */}
      <section className="space-y-3">
        <h2 className="font-bold text-foreground">{t("qa.mesRamassages")}</h2>
        {mine.length > 0 ? (
          <div className="space-y-3">{mine.map((c) => <ParcelCard key={c.id} c={c} />)}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-muted">{t("livreur.noRamAssigned")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
