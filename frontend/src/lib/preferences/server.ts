import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { LOCALE_COOKIE, THEME_COOKIE, type Theme } from "./constants";

/** Visitor preferences for server rendering. Defaults: Arabic, dark theme. */
export async function getPreferences(): Promise<{ locale: Locale; theme: Theme; fromCookie: boolean }> {
  const store = await cookies();
  const locale = store.get(LOCALE_COOKIE)?.value;
  const theme = store.get(THEME_COOKIE)?.value;
  return {
    locale: locale === "en" ? "en" : "ar",
    theme: theme === "light" ? "light" : "dark",
    fromCookie: locale === "ar" || locale === "en",
  };
}
