import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { issueMobileToken } from "@/lib/auth/mobile-auth";
import { clientGate } from "@/lib/auth/onboarding";
import { mobileJson, corsPreflight } from "@/lib/api/cors";

const schema = z.object({ identifier: z.string().min(3), password: z.string().min(1) });

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Données invalides." }, { status: 400 });
  const { identifier, password } = parsed.data;

  const account = await prisma.account.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] },
    select: {
      id: true,
      role: true,
      passwordHash: true,
      status: true,
      client: { select: { id: true, nom: true, cni: true, banque: true, rib: true, cniRectoFile: true, cniVersoFile: true } },
      livreur: { select: { id: true, nom: true, prenom: true } },
    },
  });

  const INVALID = mobileJson(req, { message: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  if (!account) return INVALID;
  if (!(await verifyPassword(password, account.passwordHash))) return INVALID;

  // Mobile is client + livreur only.
  if (account.role !== "CLIENT" && account.role !== "LIVREUR") {
    return mobileJson(req, { message: "Application réservée aux clients et livreurs." }, { status: 403 });
  }
  if (account.role === "LIVREUR" && account.status !== "ACTIVE") {
    return mobileJson(req, { message: "Votre compte n'est pas encore actif." }, { status: 403 });
  }
  if (account.role === "CLIENT" && (account.status === "SUSPENDED" || account.status === "INACTIVE")) {
    return mobileJson(req, { message: "Votre compte n'est pas encore actif." }, { status: 403 });
  }

  const token = await issueMobileToken(account.id, account.role);
  const gate = account.role === "CLIENT" ? clientGate(account.status, account.client) : null;
  const user = {
    id: account.id,
    role: account.role,
    status: account.status,
    name: account.role === "CLIENT" ? account.client?.nom : `${account.livreur?.prenom ?? ""} ${account.livreur?.nom ?? ""}`.trim(),
    clientId: account.client?.id ?? null,
    livreurId: account.livreur?.id ?? null,
    onboardingRoute: gate, // "/onboarding" | "/onboarding/pending" | null
  };
  return mobileJson(req, { token, user }, { status: 200 });
}
