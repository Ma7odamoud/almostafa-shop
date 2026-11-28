// Single entry point for all HTTP calls to the ASP.NET Core backend.
//
// - In the browser, requests go to the same origin (`/api/...`) and Next.js rewrites proxy them to
//   the backend, so the HttpOnly session cookie stays first-party and no CORS is involved.
// - On the server (Server Components / proxy.ts) requests go straight to API_INTERNAL_URL.
// - Admin state-changing requests automatically carry the antiforgery header.
import { ApiError } from "./errors";
import type { ProblemDetails } from "./types";

type Query = Record<string, string | number | boolean | readonly string[] | null | undefined>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  /** JSON-serialised unless it is FormData. */
  body?: unknown;
  signal?: AbortSignal;
  /** Extra headers, e.g. a forwarded Cookie header for server-side calls. */
  headers?: HeadersInit;
}

const CSRF_HEADER = "X-XSRF-TOKEN";
let csrfToken: string | null = null;

function baseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.API_INTERNAL_URL ?? "http://localhost:5080";
}

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.append(key, String(value));
  }
  const qs = params.toString();
  return `${baseUrl()}${path}${qs ? `?${qs}` : ""}`;
}

function needsCsrf(path: string, method: string) {
  return path.startsWith("/api/v1/admin/") && method !== "GET";
}

async function fetchCsrfToken(signal?: AbortSignal): Promise<string> {
  const data = await send<{ token: string }>("/api/v1/auth/csrf", { signal });
  csrfToken = data.token;
  return csrfToken;
}

/** Forget the cached antiforgery token (call on logout). */
export function resetCsrfToken() {
  csrfToken = null;
}

async function send<T>(path: string, options: RequestOptions = {}, csrf?: string): Promise<T> {
  const method = options.method ?? "GET";
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }
  if (csrf) headers.set(CSRF_HEADER, csrf);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body,
      signal: options.signal,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, { title: "Network error" });
  }

  if (response.status === 204) return undefined as T;

  const isJson = response.headers.get("content-type")?.includes("json") ?? false;
  const payload: unknown = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) throw new ApiError(response.status, (payload ?? {}) as Partial<ProblemDetails>);
  return payload as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  if (!needsCsrf(path, method)) return send<T>(path, options);

  const token = csrfToken ?? (await fetchCsrfToken(options.signal));
  try {
    return await send<T>(path, options, token);
  } catch (error) {
    // The token is bound to the session; after a re-login it is stale. Refresh once and retry.
    if (error instanceof ApiError && error.code === "invalid_csrf_token") {
      return send<T>(path, options, await fetchCsrfToken(options.signal));
    }
    throw error;
  }
}
