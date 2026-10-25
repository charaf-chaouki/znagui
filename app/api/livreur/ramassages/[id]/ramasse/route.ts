import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ramasseColis, RamassageError } from "@/lib/server/ramassage.service";

const schema = z.object({ colisId: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    await ramasseColis(user.livreur.id, id, parsed.data.colisId, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof RamassageError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
