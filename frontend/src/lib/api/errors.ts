import type { ProblemDetails } from "./types";

/**
 * Every failed API call surfaces as an ApiError. `code` is the stable machine-readable code from
 * the backend's Problem Details (e.g. "validation_failed", "invalid_credentials", "network_error").
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;
  readonly traceId?: string;

  constructor(status: number, problem: Partial<ProblemDetails>) {
    super(problem.detail ?? problem.title ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = problem.code ?? (status === 0 ? "network_error" : "error");
    this.fieldErrors = problem.errors ?? {};
    this.traceId = problem.traceId;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

/** A message suitable for showing to the user, in their language for well-known failures. */
export function errorMessage(error: unknown, locale: "ar" | "en"): string {
  const ar = locale === "ar";
  if (error instanceof ApiError) {
    if (error.isNetworkError)
      return ar ? "تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى." : "Could not reach the server. Check your connection and try again.";
    if (error.code === "rate_limited")
      return ar ? "محاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى." : "Too many attempts. Please wait a moment and try again.";
    if (error.code === "invalid_credentials")
      return ar ? "بيانات الدخول غير صحيحة." : "Invalid credentials.";
    if (error.status >= 500)
      return ar ? "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." : "Something went wrong. Please try again later.";
    return error.message;
  }
  return ar ? "حدث خطأ غير متوقع." : "Something went wrong.";
}
