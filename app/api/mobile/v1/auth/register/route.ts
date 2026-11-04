import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { issueMobileToken } from "@/lib/auth/mobile-auth";
import { clientGate } from "@/lib/auth/onboarding";
import { mobileJson, corsPreflight } from "@/lib/api/cors";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  ville: z.string().min(1),
  password: z.string().min(6),
});

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Mobile client sign-up: creates a PENDING client account and returns a bearer
// token (like /auth/login) so the app logs in immediately and goes to onboarding.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return mobileJson(req, { message: "Données invalides." }, { status: 400 });
  const { name, email, phone, ville, password } = parsed.data;

  const existing = await prisma.account.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { id: true },
  });
  if (existing) {
    return mobileJson(req, { message: "Un compte existe déjà avec cet email ou ce téléphone." }, { status: 409 });
  }

  const villeRow = await prisma.ville.upsert({ where: { nom: ville }, update: {}, create: { nom: ville } });

  const account = await prisma.account.create({
    data: {
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "CLIENT",
      status: "PENDING",
      client: { create: { nom: name, telephone: phone, villeId: villeRow.id } },
    },
    select: {
      id: true,
      role: true,
      status: true,
      client: { select: { id: true, nom: true, cni: true, banque: true, rib: true, cniRectoFile: true, cniVersoFile: true } },
    },
  });

  const token = await issueMobileToken(account.id, account.role);
  const gate = clientGate(account.status, account.client); // new account → "/onboarding"
  const user = {
    id: account.id,
    role: account.role,
    status: account.status,
    name: account.client?.nom ?? name,
    clientId: account.client?.id ?? null,
    livreurId: null,
    onboardingRoute: gate,
  };
  return mobileJson(req, { token, user }, { status: 201 });
}
