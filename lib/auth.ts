// ============================================================
// Auth helpers — JWT-based admin auth using Next.js built-in jose
// ⚠️  DEMO MODE:
//   - Admin credentials are stored in .env.local
//   - Do NOT hard-code real passwords here.
//   - Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in .env.local
//   - JWT_SECRET must be a long random string set in .env.local
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "CHANGE-THIS-SECRET-IN-DOTENV-LOCAL-MIN-32-CHARS"
);

const COOKIE_NAME = "almostafa_admin";

export interface AdminPayload {
  email: string;
  role: "admin";
}

export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role === "admin" && payload.email) {
      return payload as unknown as AdminPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function checkAdminCredentials(email: string, password: string): boolean {
  // ⚠️  Credentials come from environment variables ONLY.
  // Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local
  // Never hard-code real credentials here.
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) {
    // If env vars not set, auth always fails.
    return false;
  }
  return email === adminEmail && password === adminPassword;
}
