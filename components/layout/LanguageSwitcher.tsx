"use client";
import "flag-icons/css/flag-icons.min.css";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LOCALE_META[locale];

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("lang.choose")}
        title={t("lang.choose")}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <div>
        <span className={`fi fi-${current.flag} rounded-md`}></span>
        </div>
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute end-0 z-40 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {LOCALES.map((loc) => {
            const meta = LOCALE_META[loc];
            const active = loc === locale;
            return (
              <button
                key={loc}
                onClick={() => choose(loc)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 ${active ? "font-semibold text-brand-dark" : "text-slate-600"}`}
              >
                <span className={`fi fi-${meta.flag} rounded-md`}></span>
                <span className="flex-1 text-start">{meta.label}</span>
                {active && <Check className="h-4 w-4 text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
