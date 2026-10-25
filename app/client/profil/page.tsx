import { redirect } from "next/navigation";
import { UserRound, IdCard, Phone, Mail, MapPin, Landmark, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getClientProfile } from "@/lib/server/client-portal.service";

export const metadata = { title: "Mon profil" };
export const instant = false;

export default async function ClientProfilPage() {
  const user = await getCurrentUser();
  if (!user?.client) redirect("/connexion?next=/client/profil");

  const { t } = await getServerT();
  const p = await getClientProfile(user.client.id);
  if (!p) redirect("/client");

  return (
    <div className="space-y-5">
      <PageHeader title={t("profil.title")} subtitle={t("profil.sub")} />

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-lg font-bold text-brand-dark">
          {p.nom.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{p.nom}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="h-4 w-4" /> {t("profil.membreDepuis")} {p.memberSince}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t("profil.identiteContact")} icon={<UserRound className="h-4 w-4" />}>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Row icon={<IdCard className="h-4 w-4" />} label={t("profil.cni")} value={p.cni || "—"} />
            <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={p.telephone} />
            <Row icon={<Mail className="h-4 w-4" />} label={t("col.email")} value={p.email} />
            <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={p.ville} />
            <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={p.adresse ?? "—"} />
          </div>
        </Card>

        <Card title={t("profil.infosBancaires")} icon={<Landmark className="h-4 w-4" />}>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.banque")} value={p.banque ?? "—"} />
            <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.rib")} value={p.rib ?? "—"} />
          </div>
        </Card>
      </div>

      <p className="text-sm text-muted">
        {t("profil.contactAgence")}
      </p>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
