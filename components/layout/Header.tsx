"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserPlus, LogIn } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const NAV: { href: string; key: MessageKey }[] = [
  { href: "/#services", key: "home.nav.services" },
  { href: "/#comment", key: "home.nav.comment" },
  { href: "/suivi", key: "home.nav.suivi" },
  { href: "/#faq", key: "home.nav.faq" },
  { href: "/#contact", key: "home.nav.contact" },
];

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo heightClass="h-9" priority />

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-brand">
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher compact />
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface"
          >
            <LogIn className="h-4 w-4" /> {t("auth.loginTitle")}
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-dark"
          >
            <UserPlus className="h-4 w-4" /> {t("home.nav.signup")}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-foreground hover:bg-surface"
            aria-label={t("home.nav.menu")}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface"
              >
                {t(n.key)}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold"
              >
                {t("auth.loginTitle")}
              </Link>
              <Link
                href="/inscription"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-brand-contrast"
              >
                {t("home.nav.signup")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
