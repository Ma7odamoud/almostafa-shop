"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme, useLang, useCart } from "./Providers";
import { t } from "@/lib/i18n";
import {
  ListIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ConcreteShoppingBagIcon,
  MagnifyingGlassIcon,
} from "./Icons";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLang();
  const { items } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Total cart item count
  const cartCount = items.reduce((sum, item) => sum + item.meters, 0);

  // Is this the homepage where transparent hero header is active?
  const isHome = pathname === "/";
  const isAr = locale === "ar";

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
  // Coherent theme background and foreground in BOTH top (scrollY = 0) and scrolled states
  // Eliminates white flash, disappearing controls, and scroll-dependent contrast failure
  const headerBg = "var(--bg)";
  const headerBorder = "1px solid var(--border-subtle)";
  const iconColor = "var(--fg)";

  // Logo for both light and dark themes as supplied
  const logoSrc = "/logo.png";

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          backgroundColor: headerBg,
          borderBottom: headerBorder,
          boxShadow: scrolled ? "0 2px 10px rgba(0, 0, 0, 0.08)" : "none",
          transition: "box-shadow 0.2s ease, background-color var(--transition-base), border-color var(--transition-base)",
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
          {/* MENU TRIGGER:
              In Arabic (RTL): start of flex row is the physical RIGHT edge.
              In English (LTR): start of flex row is the physical LEFT edge.
          */}
          <div
            className="header-menu-side"
            style={{
              display: "flex",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={isAr ? "فتح القائمة" : "Open menu"}
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
                transition: "color 0.2s ease, opacity 0.2s ease",
                opacity: 1,
              }}
            >
              <ListIcon size={24} />
            </button>
          </div>

          {/* Centered Logo */}
          <div
            className="header-logo-container"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
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

          {/* UTILITY ICONS GROUP:
              In Arabic (RTL): end of flex row is the physical LEFT edge.
              In English (LTR): end of flex row is the physical RIGHT edge.
              Adjacent pair: Theme Control + Language Control, then Cart.
          */}
          <div
            className="header-icons-side"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              zIndex: 10,
            }}
          >
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen((s) => !s)}
              aria-label={isAr ? "بحث" : "Search"}
              title={isAr ? "بحث عن قماش" : "Search fabrics"}
              style={{
                background: "none",
                border: "none",
                color: iconColor,
                cursor: "pointer",
                minWidth: 40,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                transition: "color 0.2s ease, opacity 0.2s ease",
              }}
            >
              <MagnifyingGlassIcon size={20} />
            </button>

            {/* Theme Toggle Button (Compact Sun/Moon icon in header) */}
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? isAr
                    ? "التحويل للوضع الفاتح"
                    : "Switch to Light Mode"
                  : isAr
                  ? "التحويل للوضع الداكن"
                  : "Switch to Dark Mode"
              }
              title={
                theme === "dark"
                  ? isAr
                    ? "التحويل للوضع الفاتح"
                    : "Switch to Light Mode"
                  : isAr
                  ? "التحويل للوضع الداكن"
                  : "Switch to Dark Mode"
              }
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
                transition: "color 0.2s ease, opacity 0.2s ease",
              }}
            >
              {theme === "dark" ? <SunIcon size={21} /> : <MoonIcon size={21} />}
            </button>

            {/* Language Switcher (Directly adjacent to Theme toggle) */}
            <button
              onClick={toggleLocale}
              aria-label={isAr ? "Switch to English" : "التحويل للغة العربية"}
              title={isAr ? "Switch to English" : "التحويل للغة العربية"}
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
                padding: "4px 6px",
                transition: "color 0.2s ease, opacity 0.2s ease",
              }}
            >
              {isAr ? (
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
                      marginTop: 2,
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
                      marginTop: 2,
                      fontFamily: "var(--font-ar)",
                      color: iconColor,
                    }}
                  >
                    العربية
                  </span>
                </>
              )}
            </button>

            {/* Shopping bag (Exact Concrete.store 3D icon requested by user) */}
            <Link
              href="/cart"
              aria-label={isAr ? `سلة التسوق (${cartCount})` : `Shopping Cart (${cartCount})`}
              title={isAr ? `سلة التسوق (${cartCount})` : `Shopping Cart (${cartCount})`}
              style={{
                color: iconColor,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                padding: "8px 10px",
                transition: "color 0.2s ease, opacity 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 20,
                  height: 23,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ConcreteShoppingBagIcon size={20} />
                <span
                  style={{
                    position: "absolute",
                    top: "13px",
                    left: "38%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: "var(--font-en)",
                    color: "var(--price)",
                    lineHeight: 1,
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg)",
              padding: "10px 15px",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchInput.trim();
                setSearchOpen(false);
                router.push(q ? `/fabrics?q=${encodeURIComponent(q)}` : "/fabrics");
              }}
              style={{
                maxWidth: 680,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="search"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  isAr
                    ? "ابحث عن قماش (صوف، كتان، كحلي...)"
                    : "Search fabrics (wool, linen, navy...)"
                }
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--fg)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "9px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-fg)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {isAr ? "بحث" : "Search"}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label={t(locale, "close")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                }}
              >
                <XIcon size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "قائمة التصفح" : "Navigation menu"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
          }}
        >
          {/* Backdrop overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              transition: "opacity 0.28s ease",
            }}
          />

          {/* Drawer panel with explicit anchoring for Arabic (Right) vs English (Left) */}
          <div
            className={`menu-drawer-panel ${isAr ? "drawer-ar" : "drawer-en"}`}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              right: isAr ? 0 : "auto",
              left: isAr ? "auto" : 0,
              width: "min(340px, 85vw)",
              height: "100%",
              backgroundColor: "var(--bg)",
              borderLeft: isAr ? "1px solid var(--border)" : "none",
              borderRight: !isAr ? "1px solid var(--border)" : "none",
              boxShadow: isAr
                ? "-10px 0 40px rgba(0,0,0,0.4)"
                : "10px 0 40px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              padding: "24px 20px",
              zIndex: 2001,
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
                {isAr ? "المصطفى" : "Al-Mostafa"}
              </span>

              <button
                onClick={() => setMenuOpen(false)}
                aria-label={isAr ? "إغلاق القائمة" : "Close menu"}
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
                  padding: "10px",
                  opacity: 0.85,
                  transition: "opacity 0.2s ease",
                }}
              >
                <XIcon size={20} />
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
                      textAlign: isAr ? "right" : "left",
                    }}
                    className="uppercase-en"
                  >
                    <span>{label}</span>
                    <span style={{ display: "flex", alignItems: "center", opacity: 0.7 }}>
                      {isAr ? <CaretLeftIcon size={16} /> : <CaretRightIcon size={16} />}
                    </span>
                  </Link>
                );
              })}
            </nav>
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

        /* Language-aware explicit slide-in animations */
        .drawer-ar {
          animation: slideInDrawerAr 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .drawer-en {
          animation: slideInDrawerEn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideInDrawerAr {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInDrawerEn {
          from {
            transform: translateX(-100%);
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
