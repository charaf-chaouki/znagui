import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthAccount } from "@/lib/auth/current-user";
import { clientGate } from "@/lib/auth/onboarding";
import { homeForRole } from "@/lib/auth/session";

const schema = z.object({
  cni: z.string().min(3, "CNI requise"),
  banque: z.string().min(2, "Banque requise"),
  rib: z.string().min(4, "RIB requis"),
  cniRectoFile: z.string().min(1, "Photo CIN recto requise"),
  cniVersoFile: z.string().min(1, "Photo CIN verso requise"),
  ribFile: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const account = await getAuthAccount();
  if (!account || account.role !== "CLIENT" || !account.client) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  const { cni, banque, rib, cniRectoFile, cniVersoFile, ribFile } = parsed.data;

  await prisma.client.update({
    where: { id: account.client.id },
    data: { cni, banque, rib, cniRectoFile, cniVersoFile, ribFile: ribFile || null },
  });

  // Onboarding complete; account stays PENDING until an admin/agence validates it.
  const gate = clientGate(account.status, {
    cni,
    banque,
    rib,
    cniRectoFile,
    cniVersoFile,
  });
  return NextResponse.json({ ok: true, redirectTo: gate ?? homeForRole("CLIENT") });
}
