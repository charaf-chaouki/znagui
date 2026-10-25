import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus, User, IdCard, Phone, Mail, MapPin, Landmark, Package, Truck, FileText, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { getServerT, type ServerT } from "@/lib/i18n/server";
import { getClient } from "@/lib/server/client.service";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getClient(id);
  return { title: c ? c.nom : "Client" };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, tv } = await getServerT();
  const c = await getClient(id);
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.clients")}
      </Link>

      <PageHeader
        title={c.nom}
        subtitle={tv("detail.inscritLe", { d: c.createdAt })}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/admin/colis/nouveau?client=${c.id}`} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-dark">
              <Plus className="h-4 w-4" /> {t("btn.addColis")}
            </Link>
            <Link href={`/admin/clients/${c.id}/modifier`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Pencil className="h-4 w-4" /> {t("common.edit")}
            </Link>
          </div>
        }
      />
      <AccountStatutBadge statut={c.status} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title={t("profil.identiteContact")} icon={<User className="h-4 w-4" />}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<IdCard className="h-4 w-4" />} label={t("profil.cni")} value={c.cni || "—"} />
              <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={c.telephone} />
              <Row icon={<Mail className="h-4 w-4" />} label={t("detail.emailConnexion")} value={c.email} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={c.ville} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={c.adresse ?? "—"} />
            </div>
          </Card>

          <Card title={t("profil.infosBancaires")} icon={<Landmark className="h-4 w-4" />}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.banque")} value={c.banque ?? "—"} />
              <Row icon={<Landmark className="h-4 w-4" />} label={t("profil.rib")} value={c.rib ?? "—"} />
            </div>
          </Card>

          <Card title={t("ff.documents")} icon={<FileText className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <DocLink label={t("cf.cniRecto")} url={c.cniRectoFile} tt={t} />
              <DocLink label={t("cf.cniVerso")} url={c.cniVersoFile} tt={t} />
              <DocLink label={t("profil.rib")} url={c.ribFile} tt={t} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Stat icon={<Package className="h-5 w-5" />} label={t("col.colisTotal")} value={c.colisTotal} />
          <Stat icon={<Truck className="h-5 w-5" />} label={t("detail.colisEnCours")} value={c.colisEnCours} />
          <Stat icon={<FileText className="h-5 w-5" />} label={t("stat.factures")} value={c.factures} />
        </div>
      </div>
    </div>
  );
}

function DocLink({ label, url, tt }: { label: string; url: string | null; tt: ServerT["t"] }) {
  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
        {label} {tt("detail.docNonFourni")}
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-brand/30 bg-brand-light/40 px-4 py-3 text-sm font-medium text-brand-darker hover:bg-brand-light">
      {label} <ExternalLink className="h-4 w-4" />
    </a>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</div>
      <p className="mt-4 text-2xl font-extrabold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  );
}
