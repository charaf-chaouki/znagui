import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "./config";
import { translate, translateVars, type MessageKey } from "./dictionaries";

/** Current locale from the cookie (defaults to FR). For server components/layouts. */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export interface ServerT {
  locale: Locale;
  t: (key: MessageKey) => string;
  tv: (key: MessageKey, vars: Record<string, string | number>) => string;
}

/** Locale + bound translator for a server component. */
export async function getServerT(): Promise<ServerT> {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key) => translate(locale, key),
    tv: (key, vars) => translateVars(locale, key, vars),
  };
}
