"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, IdCard, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Props = {
  initial: {
    cni: string;
    banque: string;
    rib: string;
    cniRectoFile: string | null;
    cniVersoFile: string | null;
    ribFile: string | null;
  };
};

export function OnboardingForm({ initial }: Props) {
  const router = useRouter();
  const { t } = useI18n();

  const [cni, setCni] = useState(initial.cni);
  const [banque, setBanque] = useState(initial.banque);
  const [rib, setRib] = useState(initial.rib);
  const [cniRectoFile, setCniRecto] = useState<string | null>(initial.cniRectoFile);
  const [cniVersoFile, setCniVerso] = useState<string | null>(initial.cniVersoFile);
  const [ribFile, setRibFile] = useState<string | null>(initial.ribFile);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete =
    cni.trim().length >= 3 &&
    banque.trim().length >= 2 &&
    rib.trim().length >= 4 &&
    !!cniRectoFile &&
    !!cniVersoFile;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!complete) {
      setError(t("onb.required"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cni, banque, rib, cniRectoFile, cniVersoFile, ribFile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("onb.errorGeneric"));
        setBusy(false);
        return;
      }
      window.location.href = data.redirectTo || "/onboarding/pending";
    } catch {
      setError(t("onb.errorGeneric"));
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Identity */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <IdCard className="h-5 w-5 text-brand" /> {t("onb.sectionIdentity")}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="cni" className="mb-1.5 block text-sm font-medium text-foreground">{t("onb.cni")}</label>
            <input id="cni" required value={cni} onChange={(e) => setCni(e.target.value)} placeholder={t("onb.cniPlaceholder")} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileUpload label={t("onb.cniRecto")} value={cniRectoFile} onChange={setCniRecto} endpoint="/api/onboarding/upload" accept="image/*" />
            <FileUpload label={t("onb.cniVerso")} value={cniVersoFile} onChange={setCniVerso} endpoint="/api/onboarding/upload" accept="image/*" />
          </div>
        </div>
      </section>

      {/* Bank */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <CreditCard className="h-5 w-5 text-brand" /> {t("onb.sectionBank")}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="banque" className="mb-1.5 block text-sm font-medium text-foreground">{t("onb.banque")}</label>
              <input id="banque" required value={banque} onChange={(e) => setBanque(e.target.value)} placeholder={t("onb.banquePlaceholder")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="rib" className="mb-1.5 block text-sm font-medium text-foreground">{t("onb.rib")}</label>
              <input id="rib" required value={rib} onChange={(e) => setRib(e.target.value)} placeholder={t("onb.ribPlaceholder")} className={inputCls} />
            </div>
          </div>
          <FileUpload label={t("onb.ribFile")} value={ribFile} onChange={setRibFile} endpoint="/api/onboarding/upload" />
        </div>
      </section>

      <button
        type="submit"
        disabled={busy || !complete}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-contrast transition hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
        {t("onb.submit")}
      </button>
    </form>
  );
}
