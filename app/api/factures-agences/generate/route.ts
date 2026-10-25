import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { generateAllFacturesAgence } from "@/lib/server/facture-agence.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  try {
    const res = await generateAllFacturesAgence(user.id);
    return NextResponse.json({ ok: true, created: res.created });
  } catch (e) {
    console.error("generateAllFacturesAgence failed:", e);
    return NextResponse.json({ message: "Erreur lors de la génération des factures." }, { status: 500 });
  }
}
