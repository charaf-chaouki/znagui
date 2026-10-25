import { redirect } from "next/navigation";
import { IdCard, Phone, Mail, MapPin, Building2, Landmark } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLivreur } from "@/lib/server/livreur.service";

export const metadata = { title: "Mon profil" };
export const instant = false;

export default async function LivreurProfilPage() {
  const user = await getCurrentUser();
  if (!user?.livreur) redirect("/connexion?next=/livreur/profil");

  const l = await getLivreur(user.livreur.id);
  if (!l) redirect("/livreur");

  const initials = ((l.prenom[0] ?? "") + (l.nom[0] ?? "")).toUpperCase();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Mon profil</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-xl font-bold text-brand-dark">{initials || "L"}</div>
        <div>
          <p className="text-lg font-bold text-foreground">{l.prenom} {l.nom}</p>
          <p className="text-sm text-muted">{l.agence} · {l.ville}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="space-y-3 text-sm">
          <Row icon={<IdCard className="h-4 w-4" />} label="CNI" value={l.cni} />
          <Row icon={<Phone className="h-4 w-4" />} label="Téléphone" value={l.telephone} />
          <Row icon={<Mail className="h-4 w-4" />} label="Email" value={l.email} />
          <Row icon={<Building2 className="h-4 w-4" />} label="Agence" value={l.agence} />
          <Row icon={<MapPin className="h-4 w-4" />} label="Ville" value={l.ville} />
          <Row icon={<Landmark className="h-4 w-4" />} label="Banque" value={l.banque ?? "—"} />
          <Row icon={<Landmark className="h-4 w-4" />} label="RIB" value={l.rib ?? "—"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <Stat label="Livraisons" value={l.livraisons} />
        <Stat label="Ramassages" value={l.ramassages} />
      </div>

      <p className="text-center text-xs text-muted">Pour modifier vos informations, contactez votre agence.</p>

      <LogoutButton />
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
