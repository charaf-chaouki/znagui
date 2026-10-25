import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { statusSchema } from "@/lib/server/validators/colis";
import { updateColisStatus } from "@/lib/server/colis.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE", "LIVREUR"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  try {
    await updateColisStatus(id, parsed.data.statut, parsed.data.note ?? null, user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Colis introuvable." }, { status: 404 });
  }
}
