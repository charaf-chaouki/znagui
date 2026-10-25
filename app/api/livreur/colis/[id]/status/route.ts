import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { setLivreurColisStatus, LivreurPortalError } from "@/lib/server/livreur-portal.service";

const schema = z.object({
  statut: z.enum(["RAMASSE", "EN_COURS_DE_LIVRAISON", "LIVRE", "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR"]),
  note: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "LIVREUR" || !user.livreur) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  }
  try {
    await setLivreurColisStatus(user.livreur.id, id, parsed.data.statut, parsed.data.note ?? null, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof LivreurPortalError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
