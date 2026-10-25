import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { agenceColisSchema } from "@/lib/server/validators/colis";
import { createAgenceColis, AgenceColisError } from "@/lib/server/agence-colis.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.agence || user.role !== "AGENCE") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = agenceColisSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await createAgenceColis(user.agence.id, user.agence.villeId, parsed.data, user.id);
    return NextResponse.json({ ok: true, id: res.id, trk: res.trackingNumber }, { status: 201 });
  } catch (e) {
    const err = e as AgenceColisError;
    return NextResponse.json({ message: err.message || "Échec de la création." }, { status: err.status ?? 500 });
  }
}
