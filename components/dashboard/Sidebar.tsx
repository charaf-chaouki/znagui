"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, PackageCheck, Send, Bike, Building2,
  Users, UserRound, FileText, Settings, X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

type Item = { key: MessageKey; href: string; icon: typeof LayoutDashboard; badge?: number };
type Section = { titleKey?: MessageKey; items: Item[] };

const SECTIONS: Section[] = [
  { items: [{ key: "nav.dashboard", href: "/admin", icon: LayoutDashboard }] },
  { titleKey: "section.gestion", items: [{ key: "nav.colis", href: "/admin/colis", icon: Package }] },
  {
    titleKey: "section.operations",
    items: [
      { key: "nav.ramassages", href: "/admin/ramassages", icon: PackageCheck },
      { key: "nav.expeditionsAgences", href: "/admin/expeditions", icon: Send },
      { key: "nav.expeditionsLivreurs", href: "/admin/expeditions-livreur", icon: Bike },
    ],
  },
  {
    titleKey: "section.reseau",
    items: [
      { key: "nav.agences", href: "/admin/agences", icon: Building2 },
      { key: "nav.livreurs", href: "/admin/livreurs", icon: UserRound },
      { key: "nav.clients", href: "/admin/clients", icon: Users },
    ],
  },
  {
    titleKey: "section.facturation",
    items: [
      { key: "nav.facturesClients", href: "/admin/factures-clients", icon: FileText },
      { key: "nav.facturesLivreurs", href: "/admin/factures-livreurs", icon: FileText },
      { key: "nav.facturesAgences", href: "/admin/factures-agences", icon: FileText },
    ],
  },
  { titleKey: "section.systeme", items: [{ key: "nav.parametres", href: "/admin/parametres", icon: Settings }] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <Logo href="/admin" heightClass="h-8" />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map((sec, i) => (
            <div key={sec.titleKey ?? `top-${i}`} className={i > 0 ? "mt-5" : ""}>
              {sec.titleKey && (
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t(sec.titleKey)}
                </p>
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
                      {item.badge != null && item.badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
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
