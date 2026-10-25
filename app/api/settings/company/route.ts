import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { companySchema } from "@/lib/server/validators/settings";
import { saveCompanySettings, COMPANY_SETTINGS_TAG } from "@/lib/server/settings.service";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé." }, { status: 403 });
  }
  const parsed = companySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  await saveCompanySettings(parsed.data);
  // expire: 0 → invalidate immediately so the public site reflects the change at once.
  revalidateTag(COMPANY_SETTINGS_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
