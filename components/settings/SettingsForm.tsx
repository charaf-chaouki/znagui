"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, MapPin, Scale, Share2, AlertCircle, Check } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";
import type { CompanySettings } from "@/lib/types/settings";

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

// Module-level (stable identity) → inputs keep focus while typing.
function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>
        {label} {required && "*"}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: CompanySettings }) {
  const router = useRouter();
  const [f, setF] = useState<CompanySettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof CompanySettings, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Échec de l'enregistrement.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="Identité de la société" icon={<Building2 className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Raison sociale (nom légal)" required value={f.raisonSociale} onChange={(v) => set("raisonSociale", v)} placeholder="Ex : ZNAGUI EXPRESS SARL" />
          <TextField label="Nom commercial" value={f.nomCommercial} onChange={(v) => set("nomCommercial", v)} placeholder="Znagui Express" />
          <TextField label="Forme juridique" value={f.formeJuridique} onChange={(v) => set("formeJuridique", v)} placeholder="SARL, SA, Auto-entrepreneur…" />
          <TextField label="Capital social (DH)" value={f.capital} onChange={(v) => set("capital", v)} placeholder="100 000" />
          <div className="sm:col-span-2">
            <FileUpload label="Logo" value={f.logo || null} onChange={(url) => set("logo", url ?? "")} accept="image/*" />
          </div>
        </div>
      </Section>

      <Section title="Coordonnées" icon={<MapPin className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ville" value={f.ville} onChange={(v) => set("ville", v)} placeholder="Casablanca" />
          <TextField label="Téléphone" value={f.telephone} onChange={(v) => set("telephone", v)} placeholder="05XXXXXXXX" />
          <TextField className="sm:col-span-2" label="Adresse" value={f.adresse} onChange={(v) => set("adresse", v)} placeholder="Rue, quartier, ville" />
          <TextField label="Email" type="email" value={f.email} onChange={(v) => set("email", v)} placeholder="contact@znaguiexpress.ma" />
          <TextField label="Site web" value={f.siteWeb} onChange={(v) => set("siteWeb", v)} placeholder="https://znaguiexpress.ma" />
        </div>
      </Section>

      <Section title="Informations légales" icon={<Scale className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="ICE" value={f.ice} onChange={(v) => set("ice", v)} placeholder="Identifiant Commun Entreprise" />
          <TextField label="RC" value={f.rc} onChange={(v) => set("rc", v)} placeholder="Registre de Commerce" />
          <TextField label="IF" value={f.if} onChange={(v) => set("if", v)} placeholder="Identifiant Fiscal" />
          <TextField label="Patente" value={f.patente} onChange={(v) => set("patente", v)} />
          <TextField label="CNSS" value={f.cnss} onChange={(v) => set("cnss", v)} />
        </div>
      </Section>

      <Section title="Réseaux sociaux" icon={<Share2 className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Facebook" value={f.facebook} onChange={(v) => set("facebook", v)} placeholder="https://facebook.com/…" />
          <TextField label="Instagram" value={f.instagram} onChange={(v) => set("instagram", v)} placeholder="https://instagram.com/…" />
          <TextField label="LinkedIn" value={f.linkedin} onChange={(v) => set("linkedin", v)} placeholder="https://linkedin.com/…" />
          <TextField label="YouTube" value={f.youtube} onChange={(v) => set("youtube", v)} placeholder="https://youtube.com/…" />
          <TextField label="TikTok" value={f.tiktok} onChange={(v) => set("tiktok", v)} placeholder="https://tiktok.com/@…" />
          <TextField label="WhatsApp" value={f.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="+212 6XX XXXXXX" />
        </div>
      </Section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark">
            <Check className="h-4 w-4" /> Enregistré
          </span>
        )}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-70">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </button>
      </div>
    </form>
  );
}
