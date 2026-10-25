import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { factureLivreurStatusSchema } from "@/lib/server/validators/facture-livreur";
import { setFactureLivreurStatus, getAgenceFactureLivreurDetail } from "@/lib/server/facture-livreur.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = factureLivreurStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  // An agence may only touch factures of its own livreurs.
  if (user.role === "AGENCE") {
    if (!user.agence || !(await getAgenceFactureLivreurDetail(user.agence.id, id))) {
      return NextResponse.json({ message: "Facture introuvable." }, { status: 404 });
    }
  }
  try {
    await setFactureLivreurStatus(id, parsed.data.statut);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Facture introuvable." }, { status: 404 });
  }
}
