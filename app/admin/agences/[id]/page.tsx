import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, User, Phone, Mail, MapPin, Building2, Navigation, Package, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountStatutBadge } from "@/components/ui/StatutBadge";
import { getServerT } from "@/lib/i18n/server";
import { getAgence } from "@/lib/server/agence.service";
import type { AccountStatus } from "@prisma/client";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = await getAgence(id);
  return { title: a ? a.nom : "Agence" };
}

export default async function AgenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, tv } = await getServerT();
  const a = await getAgence(id);
  if (!a) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/agences" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {t("nav.agences")}
      </Link>

      <PageHeader
        title={a.nom}
        subtitle={tv("detail.villeCreeeLe", { v: a.ville, d: a.createdAt })}
        action={
          <Link href={`/admin/agences/${a.id}/modifier`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Pencil className="h-4 w-4" /> {t("common.edit")}
          </Link>
        }
      />
      <AccountStatutBadge statut={a.status as AccountStatus} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title={t("detail.infos")} icon={<Building2 className="h-4 w-4" />}>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row icon={<User className="h-4 w-4" />} label={t("col.responsable")} value={a.responsable} />
              <Row icon={<Phone className="h-4 w-4" />} label={t("col.telephone")} value={a.telephone ?? "—"} />
              <Row icon={<Mail className="h-4 w-4" />} label={t("detail.emailConnexion")} value={a.email} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("col.ville")} value={a.ville} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("profil.adresse")} value={a.adresse ?? "—"} />
            </div>
            {a.locationMap && (
              <a href={a.locationMap} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                <Navigation className="h-4 w-4" /> {t("detail.voirLocalisation")}
              </a>
            )}
            {a.notes && (
              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold">{t("detail.notes")}</span>{a.notes}
              </div>
            )}
          </Card>

          <Card title={tv("detail.livreursCount", { n: a.livreursCount })} icon={<Users className="h-4 w-4" />}>
            {a.livreurs.length === 0 ? (
              <p className="text-sm text-muted">{t("detail.aucunLivreur")}</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {a.livreurs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {(l.prenom[0] ?? "") + (l.nom[0] ?? "")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{l.prenom} {l.nom}</p>
                        <p className="text-xs text-muted">{l.telephone}</p>
                      </div>
                    </div>
                    <AccountStatutBadge statut={l.status as AccountStatus} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Stat icon={<Users className="h-5 w-5" />} label={t("nav.livreurs")} value={a.livreursCount} />
          <Stat icon={<Package className="h-5 w-5" />} label={t("stat.colisTraites")} value={a.colisCount} />
        </div>
      </div>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</div>
      <p className="mt-4 text-2xl font-extrabold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  );
}
