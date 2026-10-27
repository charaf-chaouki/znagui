"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, PackageCheck, Send, Bike, UserRound,
  Users, FileText, X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

type Item = { key: MessageKey; href: string; icon: typeof LayoutDashboard };
type Section = { titleKey?: MessageKey; items: Item[] };

const SECTIONS: Section[] = [
  { items: [{ key: "nav.dashboard", href: "/agence", icon: LayoutDashboard }] },
  { titleKey: "section.gestion", items: [{ key: "nav.colis", href: "/agence/colis", icon: Package }] },
  {
    titleKey: "section.operations",
    items: [
      { key: "nav.ramassages", href: "/agence/ramassages", icon: PackageCheck },
      { key: "nav.expeditionsAgences", href: "/agence/expeditions", icon: Send },
      { key: "nav.expeditionsLivreurs", href: "/agence/expeditions-livreur", icon: Bike },
    ],
  },
  {
    titleKey: "section.reseau",
    items: [
      { key: "nav.livreurs", href: "/agence/livreurs", icon: UserRound },
      { key: "nav.clients", href: "/agence/clients", icon: Users },
    ],
  },
  {
    titleKey: "section.facturation",
    items: [
      { key: "nav.facturesLivreurs", href: "/agence/factures-livreurs", icon: FileText },
      { key: "nav.facturesAgences", href: "/agence/factures-agences", icon: FileText },
    ],
  },
];

export function AgenceSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  // Boundary-aware: exact match, or a path segment under href — so
  // "/agence/expeditions-livreur" does NOT activate "/agence/expeditions".
  const isActive = (href: string) =>
    href === "/agence"
      ? pathname === "/agence"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <Logo href="/agence" heightClass="h-8" />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map((sec, i) => (
            <div key={sec.titleKey ?? `top-${i}`} className={i > 0 ? "mt-5" : ""}>
              {sec.titleKey && (
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t(sec.titleKey)}</p>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? "bg-brand-dark text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{t(item.key)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
