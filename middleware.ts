import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { verifyToken, homeForRole, SESSION_COOKIE } from "@/lib/auth/jwt";

const PREFIX_ROLE: Record<string, Role> = {
  "/admin": "ADMIN",
  "/agence": "AGENCE",
  "/livreur": "LIVREUR",
  "/client": "CLIENT",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = Object.entries(PREFIX_ROLE).find(
    ([p]) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!match) return NextResponse.next();

  const [, requiredRole] = match;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  // not logged in → to login (remember where they were going)
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // logged in but wrong space → to their own home
  if (session.role !== requiredRole) {
    const url = req.nextUrl.clone();
    url.pathname = homeForRole(session.role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agence/:path*", "/livreur/:path*", "/client/:path*"],
};
