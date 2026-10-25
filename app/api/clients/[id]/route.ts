import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateClientSchema } from "@/lib/server/validators/client";
import { updateClient, ClientError } from "@/lib/server/client.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "AGENCE"].includes(user.role)) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = updateClientSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  try {
    await updateClient(id, { ...parsed.data, password: parsed.data.password || undefined });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    if (e instanceof ClientError) return NextResponse.json({ message: e.message }, { status: 409 });
    throw e;
  }
}
