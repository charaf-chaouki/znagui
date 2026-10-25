"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, QrCode, PackageCheck, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

type Item = { key: MessageKey; href: string; icon: typeof Home };

const LEFT: Item[] = [
  { key: "nav.accueil", href: "/livreur", icon: Home },
  { key: "nav.colis", href: "/livreur/colis", icon: Package },
];
const RIGHT: Item[] = [
  { key: "nav.ramassages", href: "/livreur/ramassages", icon: PackageCheck },
  { key: "nav.profil", href: "/livreur/profil", icon: User },
];

export function LivreurBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = (href: string) => (href === "/livreur" ? pathname === "/livreur" : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="relative flex h-16 items-center justify-around px-2">
        {LEFT.map((i) => <Tab key={i.href} item={i} active={active(i.href)} label={t(i.key)} />)}

        {/* Center scan FAB */}
        <Link
          href="/livreur/scan"
          aria-label={t("nav.scan")}
          className="relative -mt-8 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-white bg-brand text-brand-contrast shadow-lg shadow-brand/30 transition active:scale-95"
        >
          <QrCode className="h-6 w-6" />
          <span className="mt-0.5 text-[10px] font-semibold">{t("nav.scan")}</span>
        </Link>

        {RIGHT.map((i) => <Tab key={i.href} item={i} active={active(i.href)} label={t(i.key)} />)}
      </div>
    </nav>
  );
}

function Tab({ item, active, label }: { item: Item; active: boolean; label: string }) {
  return (
    <Link
      href={item.href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors ${
        active ? "text-brand-dark" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <item.icon className={`h-5 w-5 ${active ? "stroke-[2.3]" : ""}`} />
      {label}
    </Link>
  );
}
