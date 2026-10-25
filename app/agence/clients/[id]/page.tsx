import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil, IdCard, Phone, Mail, MapPin, Landmark, Package, Truck, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerT } from "@/lib/i18n/server";
import { getClient } from "@/lib/server/client.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getClient(id);
  return { title: c ? c.nom : "Client" };
}

export default async function AgenceClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence) redirect("/connexion?next=/agence/clients");

  const { id } = await params;
  const { t, tv } = await getServerT();
  const c = await getClient(id);
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <Link href="/agence/clients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.clients")}
      </Link>
      <PageHeader
        title={c.nom}
        subtitle={tv("detail.inscritLe", { d: c.createdAt })}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/agence/clients/${c.id}/modifier`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Pencil className="h-4 w-4" /> {t("common.edit")}
            </Link>
          </div>
        }
      />
      <AccountStatutBadge statut={c.status} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-foreground">{t("profil.identiteContact")}</h3>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<IdCard className="h-4 w-4" />} label={t("profil.cni")} value={c.cni || "—"} />
              <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={c.telephone} />
              <Row icon={<Mail className="h-4 w-4" />} label={t("col.email")} value={c.email} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={c.ville} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={c.adresse ?? "—"} />
              <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.banque")} value={c.banque ?? "—"} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Stat icon={<Package className="h-5 w-5" />} label={t("col.colisTotal")} value={c.colisTotal} />
          <Stat icon={<Truck className="h-5 w-5" />} label={t("stat.enCours")} value={c.colisEnCours} />
          <Stat icon={<FileText className="h-5 w-5" />} label={t("stat.factures")} value={c.factures} />
        </div>
      </div>
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
