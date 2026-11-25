"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme, useLang, useCart } from "./Providers";
import { t } from "@/lib/i18n";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLang();
  const { items } = useCart();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Total cart item count
  const cartCount = items.reduce((sum, item) => sum + item.meters, 0);

  // Is this the homepage where transparent hero header is active?
  const isHome = pathname === "/";

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Header appearance states
  const isTransparent = isHome && !scrolled;

  // Background and border styles connected to olive palette
  const headerBg = isTransparent ? "transparent" : "var(--bg)";
  const headerBorder = isTransparent ? "1px solid transparent" : "1px solid var(--border-subtle)";

  // Icon color: high-contrast ivory over dark hero, theme fg when solid
  const iconColor = isTransparent ? "#EFEEEC" : "var(--fg)";

  // Logo for both light and dark themes as supplied
  const logoSrc = "/logo.png";

  return (
    <>
      {/* Demo warning bar */}
      <div className="demo-banner" role="banner">
        {t(locale, "demoBanner")}
      </div>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          backgroundColor: headerBg,
          borderBottom: headerBorder,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div
          className="header-inner"
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* In RTL (Arabic): Hamburger is at the RIGHT edge.
              In LTR (English): Hamburger is at the LEFT edge. */}
          <div
            className="header-menu-side"
            style={{
              order: locale === "ar" ? 3 : 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}
              aria-expanded={menuOpen}
              style={{
                background: "none",
                border: "none",
                color: iconColor,
                cursor: "pointer",
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px",
                transition: "color 0.3s ease",
              }}
            >
              {/* Three equal thin horizontal lines, 20px, 1.8px stroke, rounded ends */}
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <line x1="1" y1="2" x2="19" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="1" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="1" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Centered Logo */}
          <div
            className="header-logo-container"
            style={{
              order: 2,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Link
              href="/"
              aria-label="Al-Mostafa Home"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Image
                src={logoSrc}
                alt="Al-Mostafa — Fabrics & Bespoke Tailoring"
                width={160}
                height={55}
                priority
                className="header-logo-img"
                style={{
                  objectFit: "contain",
                  transition: "opacity 0.3s ease",
                  maxHeight: 55,
                }}
              />
            </Link>
          </div>

          {/* In RTL (Arabic): Icon group is at the LEFT edge.
              In LTR (English): Icon group is at the RIGHT edge.
              Order from edge inward:
              1. Shopping bag with item count inside
              2. Language switcher */}
          <div
            className="header-icons-side"
            style={{
              order: locale === "ar" ? 1 : 3,
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Shopping bag */}
            <Link
              href="/cart"
              aria-label={locale === "ar" ? `سلة التسوق (${cartCount})` : `Shopping Cart (${cartCount})`}
              style={{
                color: iconColor,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "color 0.3s ease",
              }}
            >
              <div style={{ position: "relative", width: 20, height: 23 }}>
                <svg
                  width="20"
                  height="23"
                  viewBox="0 0 20 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <path
                    d="M6 7V5C6 2.79086 7.79086 1 10 1C12.2091 1 14 2.79086 14 5V7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M1.5 7H18.5L17.2 21.2C17.05 21.65 16.65 22 16.15 22H3.85C3.35 22 2.95 21.65 2.8 21.2L1.5 7Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>

                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "var(--fs-cart-count)",
                    fontWeight: "var(--fw-cart-count)" as unknown as number,
                    letterSpacing: "var(--ls-cart-count)",
                    color: iconColor,
                    lineHeight: 1,
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </div>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLocale}
              aria-label={locale === "ar" ? "Switch to English" : "التحويل للغة العربية"}
              style={{
                background: "none",
                border: "none",
                color: iconColor,
                cursor: "pointer",
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 8px",
                transition: "color 0.3s ease",
              }}
            >
              {locale === "ar" ? (
                <>
                  <div
                    style={{
                      width: 20,
                      height: 13,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "0.5px solid rgba(0,0,0,0.15)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <svg viewBox="0 0 60 30" width="20" height="13" xmlns="http://www.w3.org/2000/svg">
                      <clipPath id="uk-clip">
                        <rect width="60" height="30" rx="2" />
                      </clipPath>
                      <g clipPath="url(#uk-clip)">
                        <rect width="60" height="30" fill="#012169" />
                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
                        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                      </g>
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      fontWeight: "var(--fw-micro)" as unknown as number,
                      lineHeight: "var(--lh-micro)",
                      marginTop: 3,
                      fontFamily: "var(--font-en)",
                      color: iconColor,
                    }}
                  >
                    English
                  </span>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 20,
                      height: 13,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "0.5px solid rgba(0,0,0,0.15)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <svg viewBox="0 0 60 36" width="20" height="13" xmlns="http://www.w3.org/2000/svg">
                      <clipPath id="eg-clip">
                        <rect width="60" height="36" rx="2" />
                      </clipPath>
                      <g clipPath="url(#eg-clip)">
                        <rect width="60" height="12" fill="#CE1126" />
                        <rect y="12" width="60" height="12" fill="#FFFFFF" />
                        <rect y="24" width="60" height="12" fill="#000000" />
                        <circle cx="30" cy="18" r="3.2" fill="#C9A84C" />
                      </g>
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      fontWeight: "var(--fw-micro)" as unknown as number,
                      lineHeight: "var(--lh-micro)",
                      marginTop: 3,
                      fontFamily: "var(--font-ar)",
                      color: iconColor,
                    }}
                  >
                    العربية
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "ar" ? "قائمة التصفح" : "Navigation menu"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
          }}
        >
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              transition: "opacity 0.3s ease",
            }}
          />

          <div
            style={{
              position: "relative",
              marginInlineStart: "auto",
              width: "min(340px, 85vw)",
              height: "100%",
              backgroundColor: "var(--bg)",
              borderInlineStart: "1px solid var(--border)",
              boxShadow: "0 0 40px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              padding: "24px 20px",
              zIndex: 2001,
              animation: "slideInDrawer 0.3s ease both",
            }}
          >
            {/* Drawer Header with Close Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border)",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--fs-h6)",
                  fontWeight: "var(--fw-h6)" as unknown as number,
                  color: "var(--fg)",
                  letterSpacing: "0.05em",
                }}
                className="uppercase-en"
              >
                {locale === "ar" ? "المصطفى" : "Al-Mostafa"}
              </span>

              <button
                onClick={() => setMenuOpen(false)}
                aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--fg)",
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1.4rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Menu Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {[
                { href: "/", label: t(locale, "home") },
                { href: "/fabrics", label: t(locale, "fabrics") },
                { href: "/contact", label: t(locale, "contact") },
                { href: "/cart", label: `${t(locale, "cart")} (${cartCount})` },
              ].map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: active ? "var(--border-subtle)" : "transparent",
                      color: "var(--fg)",
                      fontSize: "var(--fs-link)",
                      fontWeight: 600,
                      lineHeight: "var(--lh-link)",
                      minHeight: 48,
                      border: active ? "1px solid var(--border)" : "1px solid transparent",
                      transition: "background-color 0.2s ease, color 0.2s ease",
                    }}
                    className="uppercase-en"
                  >
                    <span>{label}</span>
                    <span style={{ opacity: 0.6 }}>{locale === "ar" ? "←" : "→"}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle (in the menu) */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--fs-notice)",
                    color: "var(--fg-muted)",
                  }}
                >
                  {locale === "ar" ? "المظهر" : "Theme"}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--price)" }}>
                  {theme === "dark" ? (locale === "ar" ? "الوضع الداكن" : "Dark Mode") : (locale === "ar" ? "الوضع الفاتح" : "Light Mode")}
                </span>
              </div>

              <button
                onClick={toggleTheme}
                style={{
                  width: "100%",
                  minHeight: 46,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "var(--btn-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--btn-fg)",
                  cursor: "pointer",
                  fontSize: "var(--fs-btn-sm)",
                  fontWeight: 600,
                  transition: "opacity 0.2s ease",
                }}
                className="uppercase-en"
              >
                {theme === "dark" ? (
                  <>
                    <span>☀️</span>
                    <span>{locale === "ar" ? "التحويل للوضع الفاتح" : "Switch to Light Mode"}</span>
                  </>
                ) : (
                  <>
                    <span>🌙</span>
                    <span>{locale === "ar" ? "التحويل للوضع الداكن" : "Switch to Dark Mode"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .header-inner {
          height: var(--header-height-mobile);
          padding: 0 15px;
        }
        .header-logo-img {
          width: auto !important;
          max-height: 50px !important;
        }

        @media (min-width: 768px) {
          .header-inner {
            height: var(--header-height-desktop);
            padding: 10px 24px;
          }
          .header-logo-img {
            max-height: 55px !important;
          }
        }

        @keyframes slideInDrawer {
          from {
            transform: ${locale === "ar" ? "translateX(100%)" : "translateX(-100%)"};
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
