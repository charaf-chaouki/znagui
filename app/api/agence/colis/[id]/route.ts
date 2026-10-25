import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { agenceColisSchema } from "@/lib/server/validators/colis";
import { updateAgenceColis, AgenceColisError } from "@/lib/server/agence-colis.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.agence || user.role !== "AGENCE") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = agenceColisSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await updateAgenceColis(user.agence.id, user.agence.villeId, id, parsed.data, user.id);
    return NextResponse.json({ ok: true, id: res.id });
  } catch (e) {
    const err = e as AgenceColisError;
    return NextResponse.json({ message: err.message || "Échec de la modification." }, { status: err.status ?? 500 });
  }
}
