import { redirect } from "next/navigation";
import { Construction } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentUser } from "@/lib/auth/current-user";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  AGENCE: "Agence",
  LIVREUR: "Livreur",
  CLIENT: "Client",
};

export async function RolePlaceholder({ title }: { title: string }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const name =
    user.client?.nom ??
    (user.livreur ? `${user.livreur.prenom} ${user.livreur.nom}` : null) ??
    user.agence?.nom ??
    user.email ??
    user.phone ??
    "Utilisateur";

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo heightClass="h-8" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {name}{" "}
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-darker">
                {ROLE_LABEL[user.role]}
              </span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Construction className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 max-w-md text-muted">
          Vous êtes connecté. Cet espace sera construit dans les prochaines phases
          (dashboard, colis, ramassages, expéditions, factures…).
        </p>
        <span className="mt-6 rounded-full bg-background px-4 py-2 text-sm font-medium text-muted ring-1 ring-border">
          Authentification ✓ — session active
        </span>
      </main>
    </div>
  );
}
