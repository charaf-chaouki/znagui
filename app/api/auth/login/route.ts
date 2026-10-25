import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, homeForRole } from "@/lib/auth/session";
import { clientGate } from "@/lib/auth/onboarding";

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  }
  const { identifier, password } = parsed.data;

  const account = await prisma.account.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] },
    select: {
      id: true,
      role: true,
      passwordHash: true,
      status: true,
      client: {
        select: {
          cni: true,
          banque: true,
          rib: true,
          cniRectoFile: true,
          cniVersoFile: true,
        },
      },
    },
  });

  const INVALID = NextResponse.json(
    { message: "Identifiant ou mot de passe incorrect." },
    { status: 401 },
  );
  if (!account) return INVALID;

  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) return INVALID;

  // Clients may sign in while PENDING so they can finish onboarding / see the
  // "awaiting validation" page. Only SUSPENDED / INACTIVE clients are blocked.
  if (account.role === "CLIENT") {
    if (account.status === "SUSPENDED" || account.status === "INACTIVE") {
      return NextResponse.json(
        { message: "Votre compte n'est pas encore actif. Contactez votre agence." },
        { status: 403 },
      );
    }
    await setSessionCookie({ sub: account.id, role: account.role });
    const gate = clientGate(account.status, account.client);
    return NextResponse.json({
      ok: true,
      role: account.role,
      redirectTo: gate ?? homeForRole(account.role),
    });
  }

  if (account.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "Votre compte n'est pas encore actif. Contactez votre agence." },
      { status: 403 },
    );
  }

  await setSessionCookie({ sub: account.id, role: account.role });
  return NextResponse.json({ ok: true, role: account.role, redirectTo: homeForRole(account.role) });
}
