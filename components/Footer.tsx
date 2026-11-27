"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "./Providers";
import { t } from "@/lib/i18n";

export default function Footer() {
  const { locale } = useLang();
  const year = new Date().getFullYear();

  // Supplied logo used for both themes as requested
  const logoSrc = "/logo.png";

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "3rem",
        padding: "2.5rem 15px 1.5rem",
        backgroundColor: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Logo */}
          <Link href="/" aria-label="Al-Mostafa Home">
            <Image
              src={logoSrc}
              alt="Al-Mostafa"
              width={130}
              height={50}
              style={{ objectFit: "contain", maxHeight: 50, width: "auto" }}
            />
          </Link>

          {/* Links: Home, Fabrics, Contact */}
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {[
              { href: "/", label: t(locale, "home") },
              { href: "/fabrics", label: t(locale, "fabrics") },
              { href: "/contact", label: t(locale, "contact") },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: "var(--fg-muted)",
                  fontSize: "var(--fs-link)",
                  fontWeight: "var(--fw-link)" as unknown as number,
                  lineHeight: "var(--lh-link)",
                  transition: "color 0.25s ease",
                  padding: "8px 4px",
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                className="uppercase-en"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="divider-gold" style={{ margin: "1rem 0" }} />

        {/* Contact Email & Copyright */}
        <p
          style={{
            textAlign: "center",
            color: "var(--fg-muted)",
            fontSize: "var(--fs-notice)",
            lineHeight: "var(--lh-notice)",
            fontWeight: "var(--fw-notice)" as unknown as number,
            marginBottom: "0.4rem",
          }}
        >
          <a
            href="mailto:contactalmostafainfo@gmail.com"
            style={{ color: "var(--fg)", textDecoration: "none" }}
          >
            contactalmostafainfo@gmail.com
          </a>
        </p>

        <p
          style={{
            textAlign: "center",
            color: "var(--fg-muted)",
            fontSize: "var(--fs-notice)",
            lineHeight: "var(--lh-notice)",
            fontWeight: "var(--fw-notice)" as unknown as number,
          }}
        >
          © {year} {locale === "ar" ? "المصطفى — " : "Al-Mostafa — "}
          {t(locale, "footerRights")}
        </p>
      </div>
    </footer>
  );
}
