import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createAgenceSchema } from "@/lib/server/validators/agence";
import { createAgence, AgenceError } from "@/lib/server/agence.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = createAgenceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await createAgence(parsed.data);
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (e) {
    if (e instanceof AgenceError) return NextResponse.json({ message: e.message }, { status: 409 });
    throw e;
  }
}
