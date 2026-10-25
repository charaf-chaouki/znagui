import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { generateAllFacturesLivreur } from "@/lib/server/facture-livreur.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  try {
    const res = await generateAllFacturesLivreur(user.id);
    return NextResponse.json({ ok: true, created: res.created });
  } catch (e) {
    console.error("generateAllFacturesLivreur failed:", e);
    return NextResponse.json({ message: "Erreur lors de la génération des factures." }, { status: 500 });
  }
}
