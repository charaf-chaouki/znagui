import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  ville: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  }
  const { name, email, phone, ville, password } = parsed.data;

  const existing = await prisma.account.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { message: "Un compte existe déjà avec cet email ou ce téléphone." },
      { status: 409 },
    );
  }

  const villeRow = await prisma.ville.upsert({
    where: { nom: ville },
    update: {},
    create: { nom: ville },
  });

  // New website sign-ups start PENDING: they must complete onboarding
  // (ID + bank details) and then be validated by an admin or agence.
  const account = await prisma.account.create({
    data: {
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "CLIENT",
      status: "PENDING",
      client: { create: { nom: name, telephone: phone, villeId: villeRow.id } },
    },
    select: { id: true, role: true },
  });

  await setSessionCookie({ sub: account.id, role: account.role });
  return NextResponse.json(
    { ok: true, role: account.role, redirectTo: "/onboarding" },
    { status: 201 },
  );
}
