import { LivreurBottomNav } from "@/components/livreur/LivreurBottomNav";
import { DirBoundary } from "@/components/layout/DirBoundary";

// Mobile-first shell: a phone-width column, scrollable content, fixed bottom nav.
export function LivreurShell({ children }: { children: React.ReactNode }) {
  return (
    <DirBoundary className="min-h-dvh bg-surface">
      <div className="mx-auto min-h-dvh max-w-md bg-surface">
        <main className="px-4 pb-24 pt-4">{children}</main>
      </div>
      <LivreurBottomNav />
    </DirBoundary>
  );
}
