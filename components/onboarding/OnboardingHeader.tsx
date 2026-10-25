"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function OnboardingHeader() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher compact />
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        <span className="hidden sm:inline">{t("onb.logout")}</span>
      </button>
    </div>
  );
}
