import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { factureAgencePieceSchema } from "@/lib/server/validators/facture-agence";
import { attachFactureAgencePiece } from "@/lib/server/facture-agence.service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = factureAgencePieceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }
  try {
    await attachFactureAgencePiece(id, parsed.data.pieceJointeUrl);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Facture introuvable." }, { status: 404 });
  }
}
