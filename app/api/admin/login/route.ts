import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminPassword, adminSessionToken, isAdminConfigured } from "@/lib/adminAuth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "إعدادات الحماية غير مكتملة. أضف ADMIN_PASSWORD و ADMIN_SESSION_TOKEN." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password !== adminPassword) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة." }, { status: 401 });
  }

  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: adminSessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return NextResponse.json({ ok: true });
}
