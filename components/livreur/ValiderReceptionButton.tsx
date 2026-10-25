"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function ValiderReceptionButton({ dispatchId }: { dispatchId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  async function validate() {
    setBusy(true);
    await fetch(`/api/livreur/expeditions/${dispatchId}/receive`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={validate} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-bold text-brand-contrast shadow-sm active:scale-[0.99] disabled:opacity-60">
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} {t("btn.validerReception")}
    </button>
  );
}
