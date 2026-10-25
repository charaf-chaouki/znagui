import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveLivreurScan } from "@/lib/server/livreur-portal.service";

const schema = z.object({ code: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "LIVREUR" || !user.livreur) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Code invalide." }, { status: 400 });
  }
  const found = await resolveLivreurScan(user.livreur.id, parsed.data.code.trim());
  if (!found) {
    return NextResponse.json({ message: "Aucun de vos colis ne correspond à ce code." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, trk: found.trk });
}
