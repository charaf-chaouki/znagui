import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { getAuthAccount } from "@/lib/auth/current-user";

const MAX = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Document upload for the client onboarding flow — allowed for a CLIENT session
 *  even while the account is still PENDING (not yet validated). */
export async function POST(req: Request) {
  const account = await getAuthAccount();
  if (!account || account.role !== "CLIENT" || !account.client) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Aucun fichier." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ message: "Fichier trop volumineux (max 5 Mo)." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ message: "Format non autorisé (JPG, PNG, WEBP, PDF)." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${name}`, name: file.name });
}
