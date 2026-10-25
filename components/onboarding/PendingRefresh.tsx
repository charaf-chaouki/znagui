"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function PendingRefresh() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setBusy(true);
        window.location.reload();
      }}
      disabled={busy}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      {t("onb.pendingRefresh")}
    </button>
  );
}
