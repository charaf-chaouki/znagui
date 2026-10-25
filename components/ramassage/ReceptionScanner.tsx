"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { QrScanner } from "@/components/livreur/QrScanner";

type Feedback = { ok: boolean; msg: string } | null;

export function ReceptionScanner({ ramassageId }: { ramassageId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [scannerKey, setScannerKey] = useState(0); // remount to re-arm after each scan

  const onDetected = useCallback(async (code: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/agence/ramassages/${ramassageId}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setFeedback({ ok: false, msg: data.message || "Colis non reconnu." });
      else setFeedback({ ok: true, msg: `${data.trk} reçu à l'entrepôt.` });
      router.refresh();
    } catch {
      setFeedback({ ok: false, msg: "Connexion impossible." });
    } finally {
      setBusy(false);
      setScannerKey((k) => k + 1); // re-arm scanner for the next colis
    }
  }, [ramassageId, router]);

  return (
    <div className="space-y-3">
      <QrScanner key={scannerKey} onDetected={onDetected} busy={busy} />
      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${feedback.ok ? "border-brand/30 bg-brand-light/40 text-brand-darker" : "border-danger/30 bg-danger/5 text-danger"}`}>
          {feedback.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
