"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandPlatter, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function TakeButton({ colisId, trk }: { colisId: string; trk: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function take() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/livreur/colis/${colisId}/take`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("livreur.cannotTake"));
        setBusy(false);
        return;
      }
      router.push(`/livreur/colis/${encodeURIComponent(trk)}`);
      router.refresh();
    } catch {
      setError(t("action.connError"));
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={take} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast active:scale-95 disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandPlatter className="h-4 w-4" />} {t("livreur.prendre")}
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
