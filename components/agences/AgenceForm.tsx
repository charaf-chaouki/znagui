"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, MapPin, KeyRound, AlertCircle } from "lucide-react";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { AddressMapInput } from "@/components/colis/AddressMapInput";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import type { LatLng } from "@/lib/geo";
import type { AgenceStatus } from "@/lib/types/agence";

export type AgenceFormInitial = {
  nom?: string;
  responsable?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  notes?: string;
  locationMap?: string | null;
  status?: AgenceStatus;
  email?: string;
};

const STATUS: { value: AgenceStatus; key: MessageKey }[] = [
  { value: "ACTIVE", key: "st.account.ACTIVE" },
  { value: "INACTIVE", key: "st.account.INACTIVE" },
  { value: "SUSPENDED", key: "st.account.SUSPENDED" },
];

const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const label = "mb-1.5 block text-sm font-medium text-foreground";

function parseCoords(link?: string | null): LatLng | null {
  if (!link) return null;
  const m = link.match(/mlat=([-\d.]+)&mlon=([-\d.]+)/);
  return m ? { lat: +m[1], lng: +m[2] } : null;
}

export function AgenceForm({
  initial,
  mode = "create",
  agenceId,
  redirectTo = "/admin/agences",
}: {
  initial?: AgenceFormInitial;
  mode?: "create" | "edit";
  agenceId?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [f, setF] = useState<AgenceFormInitial>({ status: "ACTIVE", ...initial });
  const [coords, setCoords] = useState<LatLng | null>(parseCoords(initial?.locationMap));
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AgenceFormInitial>(k: K, v: AgenceFormInitial[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const locationMap = coords
      ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`
      : f.locationMap ?? null;

    const payload = {
      nom: f.nom,
      responsable: f.responsable,
      ville: f.ville,
      adresse: f.adresse || null,
      telephone: f.telephone || null,
      notes: f.notes || null,
      locationMap,
      status: f.status,
      email: f.email,
      ...(password ? { password } : {}),
    };

    try {
      const res = await fetch(mode === "edit" ? `/api/agences/${agenceId}` : "/api/agences", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("form.saveFailed"));
        setSaving(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(t("action.connError"));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title={t("af.infos")} icon={<Building2 className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>{t("af.nomReq")}</label>
            <input required value={f.nom ?? ""} onChange={(e) => set("nom", e.target.value)} placeholder={t("af.nomPlaceholder")} className={input} />
          </div>
          <div>
            <label className={label}>{t("af.responsableReq")}</label>
            <input required value={f.responsable ?? ""} onChange={(e) => set("responsable", e.target.value)} placeholder={t("af.responsablePlaceholder")} className={input} />
          </div>
          <div>
            <label className={label}>{t("ff.villeReq")}</label>
            <select required value={f.ville ?? ""} onChange={(e) => set("ville", e.target.value)} className={input}>
              <option value="" disabled>{t("form.ville")}</option>
              {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>{t("ff.telephone")}</label>
            <input value={f.telephone ?? ""} onChange={(e) => set("telephone", e.target.value)} placeholder="05XXXXXXXX" className={input} />
          </div>
          <div>
            <label className={label}>{t("common.status")}</label>
            <select value={f.status} onChange={(e) => set("status", e.target.value as AgenceStatus)} className={input}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{t(s.key)}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section title={t("af.localisation")} icon={<MapPin className="h-4 w-4" />}>
        <AddressMapInput
          label={t("ff.adresse")}
          value={f.adresse ?? ""}
          coords={coords}
          placeholder={t("af.searchAdresse")}
          onChange={({ address, coords }) => { set("adresse", address); setCoords(coords); }}
        />
        <div>
          <label className={label}>{t("af.notes")}</label>
          <textarea value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder={t("af.notesPlaceholder")} className={input} />
        </div>
      </Section>

      <Section title={t("ff.compte")} icon={<KeyRound className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>{t("ff.emailReq")}</label>
            <input required type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="agence@znaguiexpress.ma" className={input} />
          </div>
          <div>
            <label className={label}>{mode === "edit" ? t("ff.newPassword") : t("ff.passwordReq")}</label>
            <input
              type="password"
              required={mode === "create"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "edit" ? t("ff.leaveBlank") : "••••••••"}
              className={input}
            />
          </div>
        </div>
      </Section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          {t("common.cancel")}
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-70">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "edit" ? t("common.save") : t("af.creerAgence")}
        </button>
      </div>
    </form>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</span>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
