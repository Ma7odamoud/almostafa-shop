// API: Admin auth — login / logout
import { NextResponse } from "next/server";
import { checkAdminCredentials, signAdminToken, getAdminCookieName } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const ok = checkAdminCredentials(email, password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = await signAdminToken(email);
    const res = NextResponse.json({ success: true });
    res.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Auth error" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(getAdminCookieName());
  return res;
}
