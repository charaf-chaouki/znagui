import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClientSchema } from "@/lib/server/validators/client";
import { createClient, ClientError } from "@/lib/server/client.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = createClientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    const res = await createClient(parsed.data);
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (e) {
    if (e instanceof ClientError) return NextResponse.json({ message: e.message }, { status: 409 });
    throw e;
  }
}
