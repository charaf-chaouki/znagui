import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { getAuthAccount } from "@/lib/auth/current-user";
import { homeForRole } from "@/lib/auth/session";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { DirBoundary } from "@/components/layout/DirBoundary";
import { getServerLocale } from "@/lib/i18n/server";

export const instant = false;

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const account = await getAuthAccount();
  if (!account) redirect("/connexion?next=/onboarding");
  if (account.role !== "CLIENT") redirect(homeForRole(account.role));

  const locale = await getServerLocale();

  return (
    <LanguageProvider initialLocale={locale}>
      <DirBoundary className="min-h-dvh bg-surface">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <Logo heightClass="h-8" />
            <OnboardingHeader />
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:py-12">{children}</main>
      </DirBoundary>
    </LanguageProvider>
  );
}
