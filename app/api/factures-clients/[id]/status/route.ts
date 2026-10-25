import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { factureClientStatusSchema } from "@/lib/server/validators/facture-client";
import { setFactureClientStatus } from "@/lib/server/facture-client.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = factureClientStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  try {
    await setFactureClientStatus(id, parsed.data.statut);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Facture introuvable." }, { status: 404 });
  }
}
