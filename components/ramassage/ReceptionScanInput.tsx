"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function ReceptionScanInput() {
  const router = useRouter();
  const { t, tv } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    setBusy(true);
    try {
      const res = await fetch("/api/agence/ramassages/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setFeedback({ ok: false, msg: data.message || t("scan.colisNonReconnu") });
      else setFeedback({ ok: true, msg: tv("scan.recuEntrepot", { trk: data.trk, ref: data.reference }) });
      router.refresh();
    } catch {
      setFeedback({ ok: false, msg: t("action.connError") });
    } finally {
      setBusy(false);
      setCode("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="rounded-xl border border-brand/30 bg-brand-light/30 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-darker">
        <ScanLine className="h-4 w-4" /> {t("scan.receptionEntrepot")}
      </p>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("scan.placeholder")}
          autoComplete="off"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button type="submit" disabled={busy || !code.trim()} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />} {t("scan.valider")}
        </button>
      </form>
      {feedback && (
        <p className={`mt-2 flex items-center gap-1.5 text-sm ${feedback.ok ? "text-brand-dark" : "text-danger"}`}>
          {feedback.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} {feedback.msg}
        </p>
      )}
    </div>
  );
}
