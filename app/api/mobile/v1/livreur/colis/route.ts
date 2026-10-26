import { requireMobile } from "@/lib/auth/mobile-auth";
import { mobileJson, corsPreflight } from "@/lib/api/cors";
import { listLivreurColis } from "@/lib/server/livreur-portal.service";
import type { LivreurColisGroup } from "@/lib/types/livreur-portal";

const GROUPS: LivreurColisGroup[] = ["EN_COURS", "LIVRE", "ECHOUEE"];

export function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  const { account, error } = await requireMobile(req, "LIVREUR");
  if (!account) return error;
  const sp = new URL(req.url).searchParams;
  const group = (GROUPS.includes(sp.get("group") as LivreurColisGroup) ? sp.get("group") : "EN_COURS") as LivreurColisGroup;
  const search = sp.get("search")?.trim() || undefined;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  return mobileJson(req, await listLivreurColis(account.livreur!.id, group, search, page));
}
