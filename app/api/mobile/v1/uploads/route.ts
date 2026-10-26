import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";

const MAX = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

// Multipart upload for mobile (CIN photos, virement proof). Any authenticated mobile user.
export async function POST(req: Request) {
  const { account, error } = await requireMobile(req);
  if (!account) return error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return mobileJson(req, { message: "Aucun fichier." }, { status: 400 });
  if (file.size > MAX) return mobileJson(req, { message: "Fichier trop volumineux (max 5 Mo)." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return mobileJson(req, { message: "Format non autorisé (JPG, PNG, WEBP, PDF)." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return mobileJson(req, { url: `/uploads/${name}`, name: file.name });
}
