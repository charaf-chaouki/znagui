"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function GenerateFacturesButton() {
  const router = useRouter();
  const { t, tv } = useI18n();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/factures-livreurs/generate", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("action.genFailed"));
        setBusy(false);
        return;
      }
      setResult(data.created === 0 ? t("action.noneGenerated") : tv("action.generated", { n: data.created }));
      setBusy(false);
      router.refresh();
    } catch {
      setError(t("action.connError"));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={generate} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm hover:bg-brand-dark disabled:opacity-70">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {t("btn.generateFactures")}
      </button>
      {result && <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-dark"><Check className="h-3.5 w-3.5" /> {result}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
