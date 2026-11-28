import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import StyledJsxRegistry from "./registry";
import { getPreferences } from "@/lib/preferences/server";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Al-Mostafa | المصطفى — Fabrics & Bespoke Tailoring",
  description: "Fine fabrics and bespoke tailoring — المصطفى للأقمشة والخياطة",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = await getPreferences();
  return (
    <html lang={prefs.locale} dir={prefs.locale === "ar" ? "rtl" : "ltr"} data-theme={prefs.theme} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Arabic pages use the Tajawal web font; fetching it with the HTML (instead of after the CSS) means text is
            usually drawn once in the right font, so lines don't reflow and the layout doesn't jump. ~27 KB in total. */}
        {prefs.locale === "ar" &&
          ["Regular", "Medium", "Bold"].map((weight) => (
            <link key={weight} rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
              href={`/fonts/tajawal/Tajawal-${weight}-Arabic.woff2`} />
          ))}
      </head>
      <body>
        <StyledJsxRegistry>
        <Providers locale={prefs.locale} theme={prefs.theme} fromCookie={prefs.fromCookie}>
          <Header />
          <main style={{ minHeight: "70vh" }}>
            {children}
          </main>
          <Footer />
        </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
