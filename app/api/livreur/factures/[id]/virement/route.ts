import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { submitVirement, FactureLivreurError } from "@/lib/server/facture-livreur.service";

const schema = z.object({ pieceJointeUrl: z.string().min(1, "Pièce jointe requise") });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "LIVREUR" || !user.livreur) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }
  try {
    await submitVirement(user.livreur.id, id, parsed.data.pieceJointeUrl);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof FactureLivreurError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
