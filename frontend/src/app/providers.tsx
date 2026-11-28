"use client";
import React from "react";
import { PreferencesProvider } from "@/lib/preferences/preferences";
import { CartProvider } from "@/features/cart/cart-context";
import type { Locale } from "@/lib/i18n";
import type { Theme } from "@/lib/preferences/constants";

export function Providers({ children, locale, theme, fromCookie }: {
  children: React.ReactNode;
  locale: Locale;
  theme: Theme;
  fromCookie: boolean;
}) {
  return (
    <PreferencesProvider initialLocale={locale} initialTheme={theme} fromCookie={fromCookie}>
      <CartProvider>{children}</CartProvider>
    </PreferencesProvider>
  );
}
