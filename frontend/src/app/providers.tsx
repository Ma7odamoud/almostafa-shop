"use client";
import React from "react";
import { PreferencesProvider } from "@/lib/preferences/preferences";
import { CartProvider } from "@/features/cart/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <CartProvider>{children}</CartProvider>
    </PreferencesProvider>
  );
}
