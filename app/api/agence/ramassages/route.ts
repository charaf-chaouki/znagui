import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createRamassage, RamassageError } from "@/lib/server/ramassage.service";

const schema = z.object({
  livreurId: z.string().min(1, "Livreur requis"),
  colisIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un colis"),
  notes: z.string().optional().nullable(),
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
    const res = await createRamassage(user.agence.id, parsed.data.livreurId, parsed.data.colisIds, user.id, parsed.data.notes);
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (e) {
    if (e instanceof RamassageError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
