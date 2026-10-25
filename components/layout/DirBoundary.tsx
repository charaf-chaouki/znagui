"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";

/** Dashboard root wrapper that carries the current locale's text direction.
 *  `dir` is inherited, so the whole dashboard subtree mirrors for Arabic (RTL)
 *  without affecting the public pages. */
export function DirBoundary({ className, children }: { className?: string; children: React.ReactNode }) {
  const { dir } = useI18n();
  return (
    <div dir={dir} className={className}>
      {children}
    </div>
  );
}
