import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getServerT } from "@/lib/i18n/server";

const schema = z
  .object({
    current: z.string().min(1),
    next: z.string().min(8),
    confirm: z.string().min(1),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"] });

/** Admin-only: change your own account password. Messages follow the UI locale. */
export async function POST(req: Request) {
  const { t } = await getServerT();

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: t("pwd.unauthorized") }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: t("pwd.invalid") }, { status: 400 });
  }
  const { current, next } = parsed.data;

  const account = await prisma.account.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!account) {
    return NextResponse.json({ message: t("pwd.accountNotFound") }, { status: 404 });
  }

  if (!(await verifyPassword(current, account.passwordHash))) {
    return NextResponse.json({ message: t("pwd.currentWrong") }, { status: 400 });
  }
  if (await verifyPassword(next, account.passwordHash)) {
    return NextResponse.json({ message: t("pwd.sameAsOld") }, { status: 400 });
  }

  await prisma.account.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return NextResponse.json({ ok: true });
}
