"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PackageSearch, FileText, UserRound, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

type Item = { key: MessageKey; href: string; icon: typeof LayoutDashboard };

// Flat navigation — no section groups.
const ITEMS: Item[] = [
  { key: "nav.dashboard", href: "/client", icon: LayoutDashboard },
  { key: "nav.colis", href: "/client/colis", icon: Package },
  { key: "nav.suivi", href: "/client/suivi", icon: PackageSearch },
  { key: "nav.factures", href: "/client/factures", icon: FileText },
  { key: "nav.profil", href: "/client/profil", icon: UserRound },
];

export function ClientSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isActive = (href: string) =>
    href === "/client" ? pathname === "/client" : pathname.startsWith(href);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <Logo href="/client" heightClass="h-8" />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {ITEMS.map((item) => {
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
        </nav>
      </aside>
    </>
  );
}
