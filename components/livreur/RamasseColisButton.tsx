"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck, Loader2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function RamasseColisButton({ ramassageId, colisId, done }: { ramassageId: string; colisId: string; done: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  if (done) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-darker"><Check className="h-3.5 w-3.5" /> {t("livreur.ramasse")}</span>;
  }

  async function ramasse() {
    setBusy(true);
    await fetch(`/api/livreur/ramassages/${ramassageId}/ramasse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colisId }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={ramasse} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-contrast active:scale-95 disabled:opacity-60">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5" />} {t("livreur.ramasse")}
    </button>
  );
}
