import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Al-Mostafa | المصطفى — Fabrics & Bespoke Tailoring",
  description: "Fine fabrics and bespoke tailoring — المصطفى للأقمشة والخياطة",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <Providers>
          <Header />
          <main style={{ minHeight: "70vh" }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
