import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { livreurStatusSchema } from "@/lib/server/validators/livreur";
import { setLivreurStatus } from "@/lib/server/livreur.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = livreurStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }
  try {
    await setLivreurStatus(id, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Livreur introuvable." }, { status: 404 });
  }
}
