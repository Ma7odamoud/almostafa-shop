// Server-only: resolves the signed-in admin by asking the backend, forwarding just the session cookie.
// The backend is the single authority on authentication; Next.js never decodes the cookie itself.
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/errors";
import { authService, type CurrentUser } from "./services/auth";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "almostafa_session";

export async function getAdminSession(): Promise<CurrentUser | null> {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session) return null;
  try {
    const user = await authService.me({ Cookie: `${SESSION_COOKIE}=${session.value}` });
    return user.roles.includes("Admin") ? user : null;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
}
