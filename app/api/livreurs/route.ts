import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createLivreurSchema } from "@/lib/server/validators/livreur";
import { createLivreur, LivreurError } from "@/lib/server/livreur.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = createLivreurSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  // An agence can only create livreurs for its own agence.
  const data = user.role === "AGENCE" && user.agence ? { ...parsed.data, agenceId: user.agence.id } : parsed.data;
  try {
    const res = await createLivreur(data);
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (e) {
    if (e instanceof LivreurError) return NextResponse.json({ message: e.message }, { status: 409 });
    throw e;
  }
}
