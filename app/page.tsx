"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLang, useTheme } from "@/components/Providers";
import { t } from "@/lib/i18n";
import type { Fabric } from "@/lib/demoData";
import { ClockIcon, MapPinIcon } from "@/components/Icons";

// ============================================================
// STORE SETTINGS — Single source of truth for visit section
// ============================================================
export const STORE_SETTINGS = {
  ADDRESS_AR: "وسط البلد، القاهرة، مصر",
  ADDRESS_EN: "Downtown Cairo, Egypt",
  HOURS_AR: "السبت – الخميس: 10:00 ص – 10:00 م",
  HOURS_EN: "Sat – Thu: 10:00 AM – 10:00 PM",
  EMAIL: "contactalmostafainfo@gmail.com",
  PHONE: "",
  MAP_LINK: "",
};

function hasRealValue(val?: string): boolean {
  if (!val) return false;
  return val.trim().length > 0 && !val.includes("[to be provided]") && !val.includes("to be provided");
}

export default function HomePage() {
  const { locale } = useLang();
  const { theme } = useTheme();
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fabrics")
      .then((r) => r.json())
      .then((data: Fabric[]) => {
        setFabrics(data.slice(0, 6));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  function scrollRow(direction: "left" | "right") {
    if (!scrollRowRef.current) return;
    const scrollAmount = 280;
    const dirMultiplier = direction === "left" ? -1 : 1;
    const actualMultiplier = locale === "ar" ? -dirMultiplier : dirMultiplier;
    scrollRowRef.current.scrollBy({ left: scrollAmount * actualMultiplier, behavior: "smooth" });
  }

  const hasMapLink = hasRealValue(STORE_SETTINGS.MAP_LINK);
  const hasPhone = hasRealValue(STORE_SETTINGS.PHONE);

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ──────────────────────────────────────────────────────────
          1. HERO SECTION (85-90dvh, never more than 1 screen on phone)
          ────────────────────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{
          position: "relative",
          width: "100%",
          height: "88dvh",
          minHeight: "540px",
          maxHeight: "760px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
          paddingLeft: "20px",
          paddingRight: "20px",
          overflow: "hidden",
          backgroundColor: "#10100F",
        }}
      >
        {/* Full-bleed hero image background with fallback pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            backgroundImage: "url('/assets/hero/hero.jpg'), url('/assets/hero/hero-placeholder.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Warm obsidian gradient overlay adapted to the palette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background:
              "linear-gradient(180deg, rgba(16,16,15,0.35) 0%, rgba(20,20,19,0.65) 45%, rgba(20,20,19,0.93) 80%, rgba(20,20,19,0.99) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero content container */}
        <div
          className="hero-content fade-in"
          style={{
            position: "relative",
            zIndex: 3,
            maxWidth: 680,
            margin: "0 auto",
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Eyebrow line */}
          <div
            style={{
              fontSize: "var(--fs-notice)",
              lineHeight: "var(--lh-notice)",
              color: "var(--price)",
              letterSpacing: "0.12em",
              marginBottom: "8px",
              fontWeight: 500,
            }}
            className="uppercase-en"
          >
            {t(locale, "heroEyebrow")}
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "var(--fs-hero)",
              lineHeight: "var(--lh-hero)",
              fontWeight: "var(--fw-hero)" as unknown as number,
              color: "#EFEEEC",
              marginBottom: "18px",
              letterSpacing: "normal",
            }}
            className="uppercase-en"
          >
            {t(locale, "heroHeading")}
          </h1>

          {/* Two side-by-side buttons connected to primary button tokens */}
          <div
            className="hero-buttons-row"
            style={{
              display: "flex",
              gap: "12px",
              width: "100%",
              maxWidth: 440,
              margin: "0 auto 12px",
            }}
          >
            <Link
              href="/fabrics"
              style={{
                flex: 1,
                minHeight: 48,
                backgroundColor: "var(--btn-bg)",
                color: "var(--btn-fg)",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(15px, 4vw, 20px)",
                lineHeight: "20px",
                fontWeight: 600,
                padding: "0 14px",
                textAlign: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
              className="uppercase-en hover-lift"
            >
              {t(locale, "heroBrowseBtn")}
            </Link>

            <Link
              href="/contact?type=tailoring"
              style={{
                flex: 1,
                minHeight: 48,
                backgroundColor: "var(--btn-bg)",
                color: "var(--btn-fg)",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(15px, 4vw, 20px)",
                lineHeight: "20px",
                fontWeight: 600,
                padding: "0 14px",
                textAlign: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
              className="uppercase-en hover-lift"
            >
              {t(locale, "heroTailorBtn")}
            </Link>
          </div>

          {/* Under buttons: location note */}
          <p
            style={{
              fontSize: "var(--fs-micro)",
              color: "#D6D0BC",
              lineHeight: 1.4,
              letterSpacing: "0.04em",
              margin: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <MapPinIcon size={13} />
            <span>{t(locale, "heroLocation")}</span>
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. FABRIC PREVIEW SECTION (horizontal swipe row of 4-6 cards)
          ────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "2.5rem 15px 2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <h2
            style={{
              fontSize: "var(--fs-h2)",
              lineHeight: "var(--lh-h2)",
              fontWeight: "var(--fw-h2)" as unknown as number,
              color: "var(--fg)",
            }}
            className="uppercase-en"
          >
            {t(locale, "fabricPreviewTitle")}
          </h2>

          <Link
            href="/fabrics"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "var(--fs-link)",
              fontWeight: 500,
              color: "var(--price)",
              transition: "color 0.2s ease",
            }}
            className="uppercase-en"
          >
            <span>{t(locale, "browseMore")}</span>
            <span style={{ fontSize: "1.1em" }}>{locale === "ar" ? "←" : "→"}</span>
          </Link>
        </div>

        {/* Swipe row container */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => scrollRow("left")}
            aria-label="Previous fabrics"
            className="desktop-scroll-arrow"
            style={{
              position: "absolute",
              top: "40%",
              left: locale === "ar" ? "auto" : "-18px",
              right: locale === "ar" ? "-18px" : "auto",
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {locale === "ar" ? "→" : "←"}
          </button>

          <button
            onClick={() => scrollRow("right")}
            aria-label="Next fabrics"
            className="desktop-scroll-arrow"
            style={{
              position: "absolute",
              top: "40%",
              right: locale === "ar" ? "auto" : "-18px",
              left: locale === "ar" ? "-18px" : "auto",
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {locale === "ar" ? "←" : "→"}
          </button>

          <div
            ref={scrollRowRef}
            className="fabric-swipe-row"
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "12px",
              paddingTop: "4px",
            }}
          >
            {loading ? (
              <div style={{ padding: "3rem", width: "100%", textAlign: "center", color: "var(--fg-muted)" }}>
                {t(locale, "loading")}
              </div>
            ) : fabrics.length === 0 ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  style={{
                    flex: "0 0 calc(68vw)",
                    maxWidth: 280,
                    minWidth: 210,
                    scrollSnapAlign: "start",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "4/5",
                      backgroundColor: "rgba(161, 153, 132, 0.15)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                      color: "var(--fg-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {locale === "ar" ? "المصطفى للأقمشة" : "Al-Mostafa"}
                  </div>
                  <h3 style={{ fontSize: "var(--fs-h6)", color: "var(--fg)", marginBottom: "4px" }}>
                    {locale === "ar" ? `قماش فاخر ${n}` : `Fine Fabric ${n}`}
                  </h3>
                  <p style={{ fontSize: "var(--fs-body)", color: "var(--fg-muted)" }}>
                    {t(locale, "demoPrice")}
                  </p>
                </div>
              ))
            ) : (
              fabrics.map((fabric) => {
                const name = locale === "ar" ? fabric.nameAr : fabric.nameEn;
                const material = locale === "ar" ? fabric.materialLabel.ar : fabric.materialLabel.en;
                const imgSrc = fabric.photos[0]?.src || "/demo/fabric-draped-placeholder.svg";
                const isOutOfStock = fabric.stockMeters === 0;

                return (
                  <Link
                    key={fabric.id}
                    href={`/fabrics/${fabric.id}`}
                    style={{
                      flex: "0 0 calc(68vw)",
                      maxWidth: 280,
                      minWidth: 210,
                      scrollSnapAlign: "start",
                      textDecoration: "none",
                      display: "block",
                      opacity: isOutOfStock ? 0.65 : 1,
                    }}
                  >
                    <div
                      className="hover-lift"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      {/* Photo */}
                      <div
                        style={{
                          position: "relative",
                          paddingTop: "125%",
                          backgroundColor: "var(--bg)",
                          overflow: "hidden",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={name}
                          loading="lazy"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/demo/fabric-draped-placeholder.svg";
                          }}
                        />

                        {isOutOfStock && (
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              right: locale === "ar" ? "auto" : 8,
                              left: locale === "ar" ? 8 : "auto",
                              backgroundColor: "var(--bg)",
                              color: "var(--color-warning)",
                              fontSize: "var(--fs-micro)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {t(locale, "outOfStock")}
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontSize: "var(--fs-notice)",
                            color: "var(--fg-muted)",
                            lineHeight: "var(--lh-notice)",
                            marginBottom: "4px",
                          }}
                          className="uppercase-en"
                        >
                          {material}
                        </span>

                        <h3
                          style={{
                            fontSize: "var(--fs-h6)",
                            lineHeight: "var(--lh-h6)",
                            fontWeight: "var(--fw-h6)" as unknown as number,
                            color: "var(--fg)",
                            marginBottom: "8px",
                            flex: 1,
                          }}
                        >
                          {name}
                        </h3>

                        <div
                          style={{
                            fontSize: "var(--fs-body)",
                            fontWeight: "var(--fw-body)" as unknown as number,
                            lineHeight: "var(--lh-body)",
                            color: fabric.pricePerMeter > 0 ? "var(--price)" : "var(--color-warning)",
                          }}
                        >
                          {fabric.pricePerMeter > 0 ? (
                            <span>
                              {fabric.pricePerMeter} {t(locale, "priceUnit")}
                            </span>
                          ) : (
                            <span style={{ fontSize: "var(--fs-micro)" }}>{t(locale, "demoPrice")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Full-width button */}
        <div style={{ marginTop: "1.5rem" }}>
          <Link
            href="/fabrics"
            style={{
              width: "100%",
              minHeight: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--fs-btn)",
              lineHeight: "var(--lh-btn)",
              fontWeight: 600,
              transition: "border-color 0.25s ease, background-color 0.25s ease",
            }}
            className="uppercase-en hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-card)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {t(locale, "browseAllFabrics")}
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. ADDRESS & VISIT SECTION (Split showroom layout)
          ────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1280,
          margin: "2rem auto 3rem",
          padding: "0 15px",
        }}
      >
        <div
          className="visit-split-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {/* Panel A: Map panel */}
          <div
            style={{
              position: "relative",
              padding: "clamp(2rem, 5vw, 3.5rem) 24px",
              backgroundColor: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {/* Map lines pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.15,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 H120 M0 60 H120 M0 100 H120 M20 0 V120 M70 0 V120 M110 0 V120 M0 0 L120 120 M120 0 L0 120' stroke='%23A19984' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`,
                backgroundSize: "120px 120px",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 2, maxWidth: 440 }}>
              <span
                style={{
                  fontSize: "var(--fs-micro)",
                  lineHeight: "var(--lh-micro)",
                  fontWeight: 600,
                  color: "var(--price)",
                  letterSpacing: "0.14em",
                  marginBottom: "12px",
                  display: "inline-block",
                }}
                className="uppercase-en"
              >
                {t(locale, "visitStoreLabel")}
              </span>

              <h2
                style={{
                  fontSize: "var(--fs-h2)",
                  lineHeight: "var(--lh-h2)",
                  fontWeight: "var(--fw-h2)" as unknown as number,
                  color: "var(--fg)",
                  marginBottom: "14px",
                }}
                className="uppercase-en"
              >
                {t(locale, "visitStoreTitle")}
              </h2>

              <p
                style={{
                  fontSize: "var(--fs-body)",
                  lineHeight: "var(--lh-body)",
                  color: "var(--fg)",
                  marginBottom: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <MapPinIcon size={16} />
                <span>{locale === "ar" ? STORE_SETTINGS.ADDRESS_AR : STORE_SETTINGS.ADDRESS_EN}</span>
              </p>

              <p
                style={{
                  fontSize: "var(--fs-notice)",
                  lineHeight: "var(--lh-notice)",
                  color: "var(--fg-muted)",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <ClockIcon size={15} />
                <span>{locale === "ar" ? STORE_SETTINGS.HOURS_AR : STORE_SETTINGS.HOURS_EN}</span>
              </p>

              <p
                style={{
                  fontSize: "var(--fs-notice)",
                  lineHeight: "var(--lh-notice)",
                  color: "var(--fg-muted)",
                  marginBottom: "24px",
                }}
              >
                <a
                  href={`mailto:${STORE_SETTINGS.EMAIL}`}
                  style={{ color: "var(--price)", textDecoration: "underline" }}
                >
                  {STORE_SETTINGS.EMAIL}
                </a>
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {hasMapLink ? (
                  <a
                    href={STORE_SETTINGS.MAP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      minHeight: 48,
                      minWidth: 140,
                      backgroundColor: "var(--btn-bg)",
                      color: "var(--btn-fg)",
                      borderRadius: "var(--radius-sm)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--fs-btn)",
                      fontWeight: 600,
                      padding: "0 18px",
                    }}
                    className="uppercase-en hover-lift"
                  >
                    {t(locale, "openMap")}
                  </a>
                ) : null}

                {hasPhone ? (
                  <a
                    href={`tel:${STORE_SETTINGS.PHONE}`}
                    style={{
                      minHeight: 48,
                      minWidth: 140,
                      backgroundColor: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--fg)",
                      borderRadius: "var(--radius-sm)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--fs-btn)",
                      fontWeight: 600,
                      padding: "0 18px",
                    }}
                    className="uppercase-en hover-lift"
                  >
                    {t(locale, "callUs")}
                  </a>
                ) : null}

                {!hasMapLink && !hasPhone && (
                  <Link
                    href="/contact"
                    style={{
                      minHeight: 48,
                      backgroundColor: "var(--btn-bg)",
                      color: "var(--btn-fg)",
                      borderRadius: "var(--radius-sm)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--fs-btn)",
                      fontWeight: 600,
                      padding: "0 24px",
                    }}
                    className="uppercase-en hover-lift"
                  >
                    {t(locale, "contact")}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Panel B: Photo of showroom */}
          <div
            style={{
              position: "relative",
              minHeight: 320,
              backgroundColor: "var(--bg)",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/showroom/showroom.jpg"
              alt="Al-Mostafa Tailoring & Showroom"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                minHeight: 320,
                display: "block",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/showroom/showroom-placeholder.svg";
              }}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .fabric-swipe-row::-webkit-scrollbar {
          display: none;
        }
        .fabric-swipe-row {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .desktop-scroll-arrow {
          display: none;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .desktop-scroll-arrow {
            display: flex;
          }
          .visit-split-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
