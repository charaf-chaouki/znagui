import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const PERKS = [
  "Suivi de vos colis en temps réel",
  "Réseau d'agences partout au Maroc",
  "Paiement à la livraison sécurisé",
];

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** marketing heading shown on the left brand panel */
  panelHeading?: React.ReactNode;
  panelText?: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  panelHeading = (
    <>
      Bienvenue sur
      <br />
      Znagui Express
    </>
  ),
  panelText = "Gérez vos colis, suivez vos livraisons et pilotez votre activité depuis un seul espace.",
}: AuthShellProps) {
  return (
    <main className="flex min-h-dvh flex-1">
      {/* Left — brand panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-darker p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <Logo variant="white" heightClass="h-10" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">{panelHeading}</h2>
          <p className="mt-3 max-w-sm text-white/80">{panelText}</p>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span className="text-sm text-white/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/60">© 2026 Znagui Express</p>
      </aside>

      {/* Right — content */}
      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>

          <div className="mb-8 lg:hidden">
            <Logo heightClass="h-9" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
