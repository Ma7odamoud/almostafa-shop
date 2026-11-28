// Theme + language preferences. Stored in cookies so the server renders the right language, direction
// and theme on the first response (no blank first paint), and mirrored in localStorage for older visits.
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { LOCALE_COOKIE, THEME_COOKIE, type Theme } from "./constants";

interface ThemeCtx { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggleTheme: () => {} });

interface LangCtx { locale: Locale; toggleLocale: () => void }
const LangContext = createContext<LangCtx>({ locale: "ar", toggleLocale: () => {} });

function persist(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
  try { localStorage.setItem(name, value); } catch { /* storage unavailable */ }
}

export function PreferencesProvider({
  children,
  initialLocale,
  initialTheme,
  fromCookie,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
  /** False when the visitor has no preference cookie yet (first visit, or saved before cookies were used). */
  fromCookie: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // One-time migration: preferences saved in localStorage by the previous version become cookies.
  useEffect(() => {
    if (fromCookie) return;
    try {
      const savedLocale = localStorage.getItem(LOCALE_COOKIE);
      const savedTheme = localStorage.getItem(THEME_COOKIE);
      /* eslint-disable react-hooks/set-state-in-effect */
      if (savedLocale === "ar" || savedLocale === "en") setLocale(savedLocale);
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch { /* storage unavailable */ }
  }, [fromCookie]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    persist(THEME_COOKIE, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    persist(LOCALE_COOKIE, locale);
  }, [locale]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}>
      <LangContext.Provider value={{ locale, toggleLocale: () => setLocale((l) => (l === "ar" ? "en" : "ar")) }}>
        {children}
      </LangContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useLang = () => useContext(LangContext);
