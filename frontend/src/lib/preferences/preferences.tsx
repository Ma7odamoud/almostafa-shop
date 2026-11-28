// Theme + language preferences, persisted in localStorage (non-sensitive UI state only).
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Theme = "dark" | "light";

interface ThemeCtx { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggleTheme: () => {} });

interface LangCtx { locale: Locale; toggleLocale: () => void }
const LangContext = createContext<LangCtx>({ locale: "ar", toggleLocale: () => {} });

const THEME_KEY = "almostafa_theme";
const LOCALE_KEY = "almostafa_locale";

/**
 * Renders children only after the saved preferences are read, so the first paint already uses the
 * visitor's theme, language and text direction (same behaviour as before the refactor).
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [locale, setLocale] = useState<Locale>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reading browser-only storage after hydration is the intended use of this effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setTheme((localStorage.getItem(THEME_KEY) as Theme) ?? "dark");
    setLocale((localStorage.getItem(LOCALE_KEY) as Locale) ?? "ar");
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale, mounted]);

  if (!mounted) return null;

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
