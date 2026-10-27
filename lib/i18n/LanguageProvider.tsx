"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_META, type Locale } from "./config";
import { translate, translateVars, type MessageKey } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
  tv: (key: MessageKey, vars: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dir = LOCALE_META[locale].dir;

  // Keep <html lang>/<html dir> in sync so the whole app (public + dashboard)
  // mirrors for Arabic (RTL) immediately on switch, before the server re-render.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      try {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      } catch { /* cookies may be unavailable */ }
      setLocaleState(next);
      // Re-render server components so any server-side translations update too.
      router.refresh();
    },
    [locale, router],
  );

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);
  const tv = useCallback((key: MessageKey, vars: Record<string, string | number>) => translateVars(locale, key, vars), [locale]);

  const value = useMemo<I18nContextValue>(() => ({ locale, dir, setLocale, t, tv }), [locale, dir, setLocale, t, tv]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback so a component rendered outside the provider still works.
    return {
      locale: DEFAULT_LOCALE,
      dir: LOCALE_META[DEFAULT_LOCALE].dir,
      setLocale: () => {},
      t: (key) => translate(DEFAULT_LOCALE, key),
      tv: (key, vars) => translateVars(DEFAULT_LOCALE, key, vars),
    };
  }
  return ctx;
}
