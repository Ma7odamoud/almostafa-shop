"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "./Providers";
import { t } from "@/lib/i18n";
import { ClockIcon, EnvelopeIcon, MapPinIcon } from "./Icons";

export default function Footer() {
  const { locale } = useLang();
  const isAr = locale === "ar";
  const year = new Date().getFullYear();

  const logoSrc = "/logo.png";

  const headingStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--fg)",
    marginBottom: "1rem",
  };

  const linkStyle: React.CSSProperties = {
    color: "var(--fg-muted)",
    fontSize: "0.84rem",
    lineHeight: 1.5,
    transition: "color 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    minHeight: 32,
  };

  return (
    <footer
      style={{
        backgroundColor: "var(--bg-card)",
        borderTop: "1px solid var(--border-subtle)",
        marginTop: "4.5rem",
        padding: "3.75rem 24px 2rem",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Main Multi-Column Luxury Grid */}
        <div
          className="footer-luxury-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2.5rem",
            paddingBottom: "3rem",
          }}
        >
          {/* Column 1: Maison Brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1rem" }}>
            <Link href="/" aria-label="Al-Mostafa Home" style={{ display: "inline-block" }}>
              <Image
                src={logoSrc}
                alt="Al-Mostafa"
                width={180}
                height={82}
                style={{ objectFit: "contain", maxHeight: 82, width: "auto" }}
              />
            </Link>
            <p
              style={{
                color: "var(--fg-muted)",
                fontSize: "0.84rem",
                lineHeight: 1.7,
                maxWidth: 280,
              }}
            >
              {isAr
                ? "دار المصطفى للأقمشة الرجالية الفاخرة والتفصيل حسب الطلب — حرفية كلاسيكية في قلب القاهرة."
                : "House of Al-Mostafa for fine menswear fabrics and bespoke tailoring — classic craftsmanship in the heart of Cairo."}
            </p>
          </div>

          {/* Column 2: Boutique Navigation */}
          <div>
            <h3 style={headingStyle}>
              {isAr ? "المتجر" : "Maison"}
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                { href: "/", label: t(locale, "home") },
                { href: "/fabrics", label: t(locale, "fabrics") },
                { href: "/contact?type=tailoring", label: isAr ? "حجز موعد تفصيل" : "Bespoke Tailoring" },
                { href: "/cart", label: t(locale, "cart") },
                { href: "/contact", label: t(locale, "contact") },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={linkStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Collections */}
          <div>
            <h3 style={headingStyle}>
              {isAr ? "الأقسام" : "Collections"}
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                { href: "/fabrics", label: isAr ? "أقمشة البدل" : "Suiting Fabrics" },
                { href: "/fabrics", label: isAr ? "أقمشة الجاكيتات" : "Jacketing" },
                { href: "/fabrics", label: isAr ? "أقمشة البناطيل" : "Trousering" },
                { href: "/fabrics", label: isAr ? "أقمشة المعاطف" : "Overcoating" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  style={linkStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Client Concierge & Atelier */}
          <div>
            <h3 style={headingStyle}>
              {isAr ? "خدمة العملاء والمعرض" : "Client Concierge"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href="mailto:contactalmostafainfo@gmail.com"
                style={{
                  ...linkStyle,
                  gap: "8px",
                  color: "var(--fg)",
                  wordBreak: "break-all",
                }}
              >
                <EnvelopeIcon size={16} />
                <span>contactalmostafainfo@gmail.com</span>
              </a>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--fg-muted)",
                  fontSize: "0.84rem",
                }}
              >
                <MapPinIcon size={16} />
                <span>{isAr ? "وسط البلد، القاهرة، مصر" : "Downtown Cairo, Egypt"}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--fg-muted)",
                  fontSize: "0.84rem",
                }}
              >
                <ClockIcon size={16} />
                <span>{isAr ? "السبت – الخميس: 10:00 ص – 10:00 م" : "Sat – Thu: 10:00 AM – 10:00 PM"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hairline Signature Bar */}
        <div
          className="footer-bottom-bar"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <p
            style={{
              color: "var(--fg-muted)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            © {year} {isAr ? "المصطفى — " : "AL-MOSTAFA — "}
            {t(locale, "footerRights")}
          </p>

          <p
            style={{
              color: "var(--fg-muted)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {isAr ? "القاهرة · مصر" : "CAIRO · EGYPT"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 640px) {
          .footer-luxury-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .footer-bottom-bar {
            flex-direction: row !important;
          }
        }
        @media (min-width: 1024px) {
          .footer-luxury-grid {
            grid-template-columns: 1.4fr 1fr 1fr 1.25fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
