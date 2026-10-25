import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { scanReception, RamassageError } from "@/lib/server/ramassage.service";

const schema = z.object({ code: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "AGENCE" || !user.agence) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Code invalide." }, { status: 400 });
  }
  try {
    const res = await scanReception(user.agence.id, id, parsed.data.code.trim(), user.id);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof RamassageError) return NextResponse.json({ message: e.message }, { status: e.status });
    throw e;
  }
}
