import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/**
 * Resolve an image for a React-PDF <Image>. Remote URLs and data URIs are
 * returned as-is; an app-relative public path (e.g. "/uploads/logo.png") is
 * read from disk and returned as a base64 data URI. Returns null on any
 * problem so documents can gracefully omit the image.
 */
export async function pdfImageSrc(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) return src;
  if (!src.startsWith("/")) return null;
  try {
    const ext = path.extname(src).toLowerCase();
    const mime = MIME[ext];
    if (!mime) return null;
    const file = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
    const buf = await readFile(file);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
