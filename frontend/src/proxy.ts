// Route guard for the admin area. Authentication is decided by the backend: we forward only the
// session cookie to GET /api/v1/auth/me and redirect to the login page unless the user is an admin.
// (API authorization itself is enforced by the backend on every request.)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:5080";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "almostafa_session";

async function isAdmin(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) return false;
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Cookie: `${SESSION_COOKIE}=${session}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const user = (await res.json()) as { roles?: string[] };
    return user.roles?.includes("Admin") ?? false;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (!(await isAdmin(request))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
