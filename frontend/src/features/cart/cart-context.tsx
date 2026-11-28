// Shopping cart, persisted in localStorage. Prices here are display-only snapshots:
// the backend re-prices every order from the catalogue at checkout.
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  fabricId: string;
  fabricNameAr: string;
  fabricNameEn: string;
  meters: number;
  pricePerMeter: number;
}

interface CartCtx {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateItemMeters: (id: string, meters: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartCtx>({
  items: [], addItem: () => {}, updateItemMeters: () => {}, removeItem: () => {}, clearCart: () => {}, total: 0,
});

const CART_KEY = "almostafa_cart";

function readCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // The cart lives only in this browser, so it is empty during server rendering and loaded right after hydration.
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return; // never overwrite the saved cart with the empty initial state
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items, loaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.fabricId === item.fabricId);
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
    setItems((prev) => prev.map((i) => (i.fabricId === id ? { ...i, meters: safeMeters } : i)));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.fabricId !== id));
  const clearCart = () => setItems([]);
  const total = items.reduce((s, i) => s + i.meters * i.pricePerMeter, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateItemMeters, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
