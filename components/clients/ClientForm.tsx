"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Landmark, IdCard, KeyRound, AlertCircle } from "lucide-react";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { FileUpload } from "@/components/ui/FileUpload";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import type { ClientStatus } from "@/lib/types/client";

export type ClientFormInitial = {
  nom?: string; telephone?: string; cni?: string;
  banque?: string; rib?: string;
  cniRectoFile?: string | null; cniVersoFile?: string | null; ribFile?: string | null;
  ville?: string; adresse?: string; status?: ClientStatus; email?: string;
};

const STATUS: { value: ClientStatus; key: MessageKey }[] = [
  { value: "ACTIVE", key: "st.account.ACTIVE" },
  { value: "PENDING", key: "st.account.PENDING" },
  { value: "SUSPENDED", key: "st.account.SUSPENDED" },
  { value: "INACTIVE", key: "st.account.INACTIVE" },
];

const input = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const label = "mb-1.5 block text-sm font-medium text-foreground";

export function ClientForm({
  initial,
  mode = "create",
  clientId,
  redirectTo = "/admin/clients",
}: {
  initial?: ClientFormInitial;
  mode?: "create" | "edit";
  clientId?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [f, setF] = useState<ClientFormInitial>({ status: "ACTIVE", ...initial });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ClientFormInitial>(k: K, v: ClientFormInitial[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      nom: f.nom, telephone: f.telephone, cni: f.cni,
      banque: f.banque || null, rib: f.rib || null,
      cniRectoFile: f.cniRectoFile || null, cniVersoFile: f.cniVersoFile || null, ribFile: f.ribFile || null,
      ville: f.ville, adresse: f.adresse || null, status: f.status, email: f.email,
      ...(password ? { password } : {}),
    };
    try {
      const res = await fetch(mode === "edit" ? `/api/clients/${clientId}` : "/api/clients", {
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
      <Section title={t("profil.identiteContact")} icon={<User className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>{t("cf.nomReq")}</label><input required value={f.nom ?? ""} onChange={(e) => set("nom", e.target.value)} placeholder={t("ff.nomSociete")} className={input} /></div>
          <div><label className={label}>{t("cf.cniReq")}</label><input required value={f.cni ?? ""} onChange={(e) => set("cni", e.target.value)} placeholder="AB123456" className={input} /></div>
          <div><label className={label}>{t("ff.telReq")}</label><input required value={f.telephone ?? ""} onChange={(e) => set("telephone", e.target.value)} placeholder="06XXXXXXXX" className={input} /></div>
          <div>
            <label className={label}>{t("ff.villeReq")}</label>
            <select required value={f.ville ?? ""} onChange={(e) => set("ville", e.target.value)} className={input}>
              <option value="" disabled>{t("form.ville")}</option>
              {MOROCCAN_CITIES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className={label}>{t("ff.adresse")}</label><input value={f.adresse ?? ""} onChange={(e) => set("adresse", e.target.value)} placeholder={t("ff.ruePlaceholder")} className={input} /></div>
        </div>
      </Section>

      <Section title={t("profil.infosBancaires")} icon={<Landmark className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>{t("profil.banque")}</label><input value={f.banque ?? ""} onChange={(e) => set("banque", e.target.value)} placeholder={t("cf.banquePlaceholder")} className={input} /></div>
          <div><label className={label}>{t("profil.rib")}</label><input value={f.rib ?? ""} onChange={(e) => set("rib", e.target.value)} placeholder={t("cf.ribPlaceholder")} className={input} /></div>
        </div>
      </Section>

      <Section title={t("ff.documents")} icon={<IdCard className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <FileUpload label={t("cf.cniRecto")} value={f.cniRectoFile ?? null} onChange={(url) => set("cniRectoFile", url)} />
          <FileUpload label={t("cf.cniVerso")} value={f.cniVersoFile ?? null} onChange={(url) => set("cniVersoFile", url)} />
          <FileUpload label={t("cf.ribFile")} value={f.ribFile ?? null} onChange={(url) => set("ribFile", url)} />
        </div>
      </Section>

      <Section title={t("ff.compte")} icon={<KeyRound className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>{t("ff.emailReq")}</label><input required type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="client@znaguiexpress.ma" className={input} /></div>
          <div>
            <label className={label}>{mode === "edit" ? t("ff.newPassword") : t("ff.passwordReq")}</label>
            <input type="password" required={mode === "create"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "edit" ? t("ff.leaveBlank") : "••••••••"} className={input} />
          </div>
          <div>
            <label className={label}>{t("common.status")}</label>
            <select value={f.status} onChange={(e) => set("status", e.target.value as ClientStatus)} className={input}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{t(s.key)}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">{t("common.cancel")}</button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-70">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "edit" ? t("common.save") : t("cf.creerClient")}
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
