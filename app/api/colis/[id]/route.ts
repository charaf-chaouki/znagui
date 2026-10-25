import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { colisSchema } from "@/lib/server/validators/colis";
import { updateColis } from "@/lib/server/colis.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = colisSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await updateColis(id, parsed.data);
    return NextResponse.json({ ok: true, id: res.id, trk: res.trackingNumber });
  } catch {
    return NextResponse.json({ message: "Colis introuvable." }, { status: 404 });
  }
}
