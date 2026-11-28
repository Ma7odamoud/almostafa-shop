import { apiRequest, resetCsrfToken } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type CurrentUser = components["schemas"]["CurrentUserDto"];

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<void>("/api/v1/auth/login", { method: "POST", body: { email, password } }),

  logout: async () => {
    try {
      await apiRequest<void>("/api/v1/auth/logout", { method: "POST" });
    } finally {
      resetCsrfToken();
    }
  },

  me: (headers?: HeadersInit) => apiRequest<CurrentUser>("/api/v1/auth/me", { headers }),
};
