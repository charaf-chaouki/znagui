import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { takeIntraColis, LivreurPortalError } from "@/lib/server/livreur-portal.service";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "LIVREUR" || !user.livreur) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  try {
    await takeIntraColis(user.livreur.id, id, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof LivreurPortalError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
