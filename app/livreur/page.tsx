import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell, Search, QrCode, PackageCheck, Truck, CheckCircle2, Wallet,
  Send, FileText, ArrowRight, MapPin,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ParcelCard } from "@/components/livreur/ParcelCard";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getLivreurDashboard } from "@/lib/server/livreur-portal.service";
import { formatNum } from "@/lib/colis-ui";

export const metadata = { title: "Accueil livreur" };
export const instant = false;

export default async function LivreurDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur");

  const { t } = await getServerT();
  const d = await getLivreurDashboard(user.livreur.id);
  const initials = ((d.prenom[0] ?? "") + (d.nom[0] ?? "")).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">{initials || "L"}</div>
          <div>
            <p className="text-xs text-muted">{t("livreur.bonjour")}</p>
            <p className="font-bold text-foreground">{d.prenom} {d.nom}</p>
            <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {d.agence} · {d.ville}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-brand" />
          </button>
        </div>
      </div>

      {/* Scan + search */}
      <div className="flex items-center gap-2">
        <form action="/livreur/colis" method="get" className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="search" placeholder={t("livreur.searchColis")} className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-3 ps-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </form>
        <Link href="/livreur/scan" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-contrast shadow-sm active:scale-95" aria-label={t("nav.scan")}>
          <QrCode className="h-5 w-5" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("stat.aRamasser")} value={d.aRamasser} icon={PackageCheck} tone="warning" />
        <StatCard label={t("stat.enLivraison")} value={d.enLivraison} icon={Truck} tone="info" />
        <StatCard label={t("stat.livresAujourdhui")} value={d.livresAujourdhui} icon={CheckCircle2} tone="brand" />
        <StatCard label={t("stat.aEncaisserShort")} value={formatNum(d.codAEncaisser)} unit="DH" icon={Wallet} tone="slate" />
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-3 gap-3">
        <Shortcut href="/livreur/a-ramasser" icon={<PackageCheck className="h-5 w-5" />} label={t("nav.aRamasser")} />
        <Shortcut href="/livreur/expeditions" icon={<Send className="h-5 w-5" />} label={t("nav.expeditions")} />
        <Shortcut href="/livreur/factures" icon={<FileText className="h-5 w-5" />} label={t("nav.factures")} />
      </div>

      {/* Tournée */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">{t("livreur.maTournee")}</h2>
          <Link href="/livreur/colis" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
            {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {d.tournee.length > 0 ? (
          <div className="space-y-3">{d.tournee.map((c) => <ParcelCard key={c.id} c={c} />)}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
            <Truck className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-muted">{t("livreur.noLivraison")}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Shortcut({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center active:scale-95">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-dark">{icon}</span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </Link>
  );
}
