import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateLivreurSchema } from "@/lib/server/validators/livreur";
import { updateLivreur, LivreurError } from "@/lib/server/livreur.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = updateLivreurSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  const data = user.role === "AGENCE" && user.agence ? { ...parsed.data, agenceId: user.agence.id } : parsed.data;
  try {
    await updateLivreur(id, { ...data, password: data.password || undefined });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    if (e instanceof LivreurError) return NextResponse.json({ message: e.message }, { status: 409 });
    throw e;
  }
}
