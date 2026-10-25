import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateAgenceSchema } from "@/lib/server/validators/agence";
import { updateAgence, AgenceError } from "@/lib/server/agence.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = updateAgenceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    await updateAgence(id, { ...parsed.data, password: parsed.data.password || undefined });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    if (e instanceof AgenceError) return NextResponse.json({ message: e.message }, { status: 409 });
    throw e;
  }
}
