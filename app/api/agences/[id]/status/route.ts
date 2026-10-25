import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { agenceStatusSchema } from "@/lib/server/validators/agence";
import { setAgenceStatus } from "@/lib/server/agence.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = agenceStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  try {
    await setAgenceStatus(id, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Agence introuvable." }, { status: 404 });
  }
}
