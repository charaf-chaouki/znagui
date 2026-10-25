import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { factureAgenceStatusSchema } from "@/lib/server/validators/facture-agence";
import { setFactureAgenceStatus } from "@/lib/server/facture-agence.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = factureAgenceStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  try {
    await setFactureAgenceStatus(id, parsed.data.statut);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Facture introuvable." }, { status: 404 });
  }
}
