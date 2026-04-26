import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, hasAdminSession } from "@/lib/adminAuth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = hasAdminSession(sessionValue);

  if (pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
