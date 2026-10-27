import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil, IdCard, Phone, Mail, MapPin, Landmark, Package, PackageCheck, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getLivreur } from "@/lib/server/livreur.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getLivreur(id);
  return { title: l ? `${l.prenom} ${l.nom}` : "Livreur" };
}

export default async function AgenceLivreurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/livreurs");

  const { id } = await params;
  const { t, tv } = await getServerT();
  const l = await getLivreur(id);
  if (!l || l.agenceId !== user.agence.id) notFound();

  return (
    <div className="space-y-5">
      <Link href="/agence/livreurs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.livreurs")}
      </Link>
      <PageHeader
        title={`${l.prenom} ${l.nom}`}
        subtitle={tv("detail.inscritLe", { d: l.createdAt })}
        action={
          <Link href={`/agence/livreurs/${l.id}/modifier`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Pencil className="h-4 w-4" /> {t("common.edit")}
          </Link>
        }
      />
      <AccountStatutBadge statut={l.status} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title={t("profil.identiteContact")}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<IdCard className="h-4 w-4" />} label={t("profil.cni")} value={l.cni} />
              <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={l.telephone} />
              <Row icon={<Mail className="h-4 w-4" />} label={t("col.email")} value={l.email} />
              <Row icon={<Truck className="h-4 w-4" />} label={t("lf.typeVehicule")} value={t(`veh.${l.vehicleType}`)} />
              <Row icon={<Truck className="h-4 w-4" />} label={t("lf.matricule")} value={l.matricule ?? "—"} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={l.ville} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={l.adresse ?? "—"} />
            </div>
          </Card>
          <Card title={t("profil.infosBancaires")}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.banque")} value={l.banque ?? "—"} />
              <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.rib")} value={l.rib ?? "—"} />
              <Row icon={<Landmark className="h-4 w-4" />} label={t("lf.ice")} value={l.ice ?? "—"} />
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Stat icon={<Package className="h-5 w-5" />} label={t("col.livraisons")} value={l.livraisons} />
          <Stat icon={<PackageCheck className="h-5 w-5" />} label={t("nav.ramassages")} value={l.ramassages} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div><p className="text-xs text-muted">{label}</p><p className="text-sm font-medium text-foreground">{value}</p></div>
    </div>
  );
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</div>
      <p className="mt-4 text-2xl font-extrabold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  );
}
