import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createExpeditionLivreur, ExpeditionLivreurError } from "@/lib/server/expedition-livreur.service";

const schema = z.object({
  livreurId: z.string().min(1, "Livreur requis"),
  colisIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un colis"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "AGENCE" || !user.agence) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }
  try {
    const res = await createExpeditionLivreur(user.agence.id, parsed.data.livreurId, parsed.data.colisIds, user.id);
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (e) {
    if (e instanceof ExpeditionLivreurError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
