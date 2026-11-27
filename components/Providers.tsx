// Context providers: Theme + Language
// Stored in localStorage so preferences persist between visits.
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

// ── Theme ─────────────────────────────────────────────────
type Theme = "dark" | "light";

interface ThemeCtx { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggleTheme: () => {} });

// ── Language ──────────────────────────────────────────────
interface LangCtx { locale: Locale; toggleLocale: () => void }
const LangContext = createContext<LangCtx>({ locale: "ar", toggleLocale: () => {} });

// ── Cart ──────────────────────────────────────────────────
export interface CartItem { fabricId: string; fabricNameAr: string; fabricNameEn: string; meters: number; pricePerMeter: number }
interface CartCtx { items: CartItem[]; addItem: (item: CartItem) => void; updateItemMeters: (id: string, meters: number) => void; removeItem: (id: string) => void; clearCart: () => void; total: number }
const CartContext = createContext<CartCtx>({ items: [], addItem: () => {}, updateItemMeters: () => {}, removeItem: () => {}, clearCart: () => {}, total: 0 });

// ── Combined Provider ─────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [locale, setLocale] = useState<Locale>("ar");
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("almostafa_theme") as Theme) ?? "dark";
    const savedLocale = (localStorage.getItem("almostafa_locale") as Locale) ?? "ar";
    const savedCart = JSON.parse(localStorage.getItem("almostafa_cart") ?? "[]") as CartItem[];
    setTheme(savedTheme);
    setLocale(savedLocale);
    setItems(savedCart);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("almostafa_theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    localStorage.setItem("almostafa_locale", locale);
  }, [locale, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("almostafa_cart", JSON.stringify(items));
  }, [items, mounted]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const toggleLocale = () => setLocale(l => l === "ar" ? "en" : "ar");

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.fabricId === item.fabricId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], meters: copy[idx].meters + item.meters };
        return copy;
      }
      return [...prev, item];
    });
  };

  const updateItemMeters = (id: string, meters: number) => {
    const safeMeters = Math.max(0.5, +meters.toFixed(1));
    setItems(prev => prev.map(i => (i.fabricId === id ? { ...i, meters: safeMeters } : i)));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.fabricId !== id));
  const clearCart = () => setItems([]);
  const total = items.reduce((s, i) => s + i.meters * i.pricePerMeter, 0);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LangContext.Provider value={{ locale, toggleLocale }}>
        <CartContext.Provider value={{ items, addItem, updateItemMeters, removeItem, clearCart, total }}>
          {children}
        </CartContext.Provider>
      </LangContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useLang = () => useContext(LangContext);
export const useCart = () => useContext(CartContext);
