// Single fabric view — Luxury tailoring detail page with specs, zoom, pill selectors, breadcrumbs
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/preferences/preferences";
import { useCart } from "@/features/cart/cart-context";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import SizeGuideModal from "@/features/catalog/components/SizeGuideModal";
import { sizeGuide } from "@/features/catalog/data/size-guide";
import type { Fabric, FabricSummary } from "@/features/catalog/types";
import FabricCard from "@/features/catalog/components/FabricCard";
import { handleImageError, responsiveImage, thumbnailSrc } from "@/lib/images";
import {
  CheckIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  RulerIcon,
  XIcon,
} from "@/components/ui/Icons";

/** Only details the owner actually entered are shown — nothing is estimated. */
function getFabricSpecs(fabric: Fabric, locale: "ar" | "en") {
  const ar = locale === "ar";
  const pick = (arText: string, enText: string) => (ar ? arText || enText : enText || arText);
  const specs: { label: string; value: string }[] = [];

  const composition = pick(fabric.compositionAr, fabric.compositionEn);
  if (composition) specs.push({ label: ar ? "التركيب" : "Composition", value: composition });
  if (fabric.widthCm != null) specs.push({ label: ar ? "العرض" : "Width", value: ar ? `${fabric.widthCm} سم` : `${fabric.widthCm} cm` });
  if (fabric.weightGsm != null) specs.push({ label: ar ? "الوزن" : "Weight", value: ar ? `${fabric.weightGsm} جم/م` : `${fabric.weightGsm} g/m` });
  if (fabric.seasonLabel) specs.push({ label: ar ? "الموسم" : "Season", value: ar ? fabric.seasonLabel.ar : fabric.seasonLabel.en });
  const care = pick(fabric.careAr, fabric.careEn);
  if (care) specs.push({ label: ar ? "العناية" : "Care", value: care });

  return specs;
}

/** Initial garment: the fabric's own category when the size guide covers it. */
function initialGarment(fabric: Fabric) {
  return sizeGuide.categories.find((c) => c.key === fabric.category)?.key ?? sizeGuide.categories[0].key;
}

/**
 * Fabric page. The fabric and its similar fabrics are fetched on the server (app/fabrics/[id]/page.tsx),
 * so the photo and price are in the first HTML response.
 */
export default function FabricDetail({ fabric, similar }: { fabric: Fabric; similar: FabricSummary[] }) {
  const { locale } = useLang();
  const { addItem } = useCart();

  const [activePhoto, setActivePhoto] = useState(0);
  const [meters, setMeters] = useState(3.2);
  const [garment, setGarment] = useState(() => initialGarment(fabric));
  const [size, setSize] = useState("M / 48");
  const [sizeOpen, setSizeOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Sync meters when garment/size changes
  useEffect(() => {
    const cat = sizeGuide.categories.find((c) => c.key === garment);
    const sizeRow = cat?.sizes.find((s) => s.size === size);
    // Intentional: re-sync local UI state when the URL / selection changes (pre-existing behaviour).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sizeRow && sizeRow.meters > 0) setMeters(sizeRow.meters);
  }, [garment, size]);

  const isAr = locale === "ar";
  const name = isAr ? fabric.nameAr : fabric.nameEn;
  const desc = isAr ? fabric.descriptionAr : fabric.descriptionEn;
  const hasPrice = fabric.pricePerMeter > 0;
  const hasStock = fabric.stockMeters > 0;
  const totalPrice = hasPrice ? formatPrice(fabric.pricePerMeter * meters, locale) : null;
  const activeCat = sizeGuide.categories.find((c) => c.key === garment) ?? sizeGuide.categories[0];
  const specs = getFabricSpecs(fabric, locale);
  const currentImgSrc = fabric.photos[activePhoto]?.src ?? "/demo/fabric-draped-placeholder.svg";
  const mainImage = responsiveImage(currentImgSrc);

  function handleAddToCart() {
    if (!fabric) return;
    addItem({
      fabricId: fabric.id,
      fabricNameAr: fabric.nameAr,
      fabricNameEn: fabric.nameEn,
      meters,
      pricePerMeter: fabric.pricePerMeter,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.5rem 3rem" }}>
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.45rem",
          fontSize: "0.8rem",
          color: "var(--fg-muted)",
          marginBottom: "1.5rem",
        }}
      >
        <Link href="/" style={{ color: "var(--fg-muted)" }}>
          {t(locale, "home")}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/fabrics" style={{ color: "var(--fg-muted)" }}>
          {t(locale, "fabrics")}
        </Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: "var(--fg-muted)" }}>
          {isAr ? fabric.categoryLabel.ar : fabric.categoryLabel.en}
        </span>
        <span aria-hidden="true">/</span>
        <span style={{ color: "var(--fg)", fontWeight: 500 }}>{name}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }} className="detail-grid">
        {/* ── Photos + Zoom ─────────────────────────────────── */}
        <div>
          <div
            onClick={() => setZoomOpen(true)}
            role="button"
            tabIndex={0}
            aria-label={isAr ? "تكبير صورة القماش" : "Zoom fabric photo"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setZoomOpen(true);
            }}
            style={{
              position: "relative",
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              aspectRatio: "4/5",
              marginBottom: "0.75rem",
              cursor: "zoom-in",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage.src}
              srcSet={mainImage.srcSet}
              sizes={mainImage.srcSet ? "(max-width: 767px) 100vw, 560px" : undefined}
              alt={fabric.photos[activePhoto]?.alt ?? name}
              className="detail-main-img"
              // The main photo is the page's largest element: fetch it first.
              fetchPriority="high"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              onError={(e) => handleImageError(e, currentImgSrc,
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%233B3A22' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' fill='%23D6D0BC' text-anchor='middle' dy='.35em' font-size='16' font-family='serif'%3EAl-Mostafa%3C/text%3E%3C/svg%3E")}
            />

            {/* Zoom cue badge */}
            <span
              style={{
                position: "absolute",
                bottom: 12,
                insetInlineEnd: 12,
                backgroundColor: "rgba(0,0,0,0.55)",
                color: "#EFEEEC",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                backdropFilter: "blur(4px)",
              }}
            >
              <MagnifyingGlassIcon size={14} />
              <span>{isAr ? "تكبير" : "Zoom"}</span>
            </span>
          </div>

          {/* Thumbnail strip */}
          {fabric.photos.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
              {fabric.photos.map((ph, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  style={{
                    flexShrink: 0,
                    width: 72,
                    height: 90,
                    padding: 0,
                    border: `2px solid ${i === activePhoto ? "var(--price)" : "var(--border-subtle)"}`,
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "var(--bg-card)",
                    transition: "border-color 0.25s ease",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailSrc(ph.src)}
                    alt={ph.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src.endsWith(ph.src)) img.style.opacity = "0.3";
                      else img.src = ph.src;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info panel ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
          {/* Name & classification */}
          <div>
            <h1
              style={{
                color: "var(--fg)",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 500,
                letterSpacing: "0.02em",
                marginBottom: "0.6rem",
              }}
            >
              {name}
            </h1>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {[
                isAr ? fabric.categoryLabel.ar : fabric.categoryLabel.en,
                isAr ? fabric.materialLabel.ar : fabric.materialLabel.en,
                isAr ? fabric.patternLabel.ar : fabric.patternLabel.en,
                isAr ? fabric.colorLabel.ar : fabric.colorLabel.en,
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--fg-muted)",
                    fontSize: "0.74rem",
                    padding: "4px 10px",
                    borderRadius: "2px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="divider-gold" style={{ margin: "0" }} />

          {/* Price & Availability */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.2rem" }}>
                {t(locale, "pricePerMeter")}
              </p>
              <p style={{ color: "var(--price)", fontSize: "1.35rem", fontWeight: 500 }}>
                {hasPrice ? formatPrice(fabric.pricePerMeter, locale) : t(locale, "demoPrice")}
              </p>
            </div>

            <span
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.45rem 0.9rem",
                fontSize: "0.82rem",
                color: "var(--fg-body)",
              }}
            >
              {hasStock
                ? `${t(locale, "stockLeft")}: ${fabric.stockMeters} ${t(locale, "meters")}`
                : t(locale, "demoStock")}
            </span>
          </div>

          {/* Description */}
          <p style={{ color: "var(--fg-body)", lineHeight: 1.75, fontSize: "0.95rem" }}>{desc}</p>

          {/* Technical Fabric Specifications (hidden when none were entered) */}
          {specs.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.65rem",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "0.9rem 1rem",
            }}
          >
            {specs.map((spec) => (
              <div key={spec.label}>
                <p style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginBottom: "2px" }}>
                  {spec.label}
                </p>
                <p style={{ fontSize: "0.86rem", color: "var(--fg)", fontWeight: 500 }}>
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
          )}

          <div className="divider-gold" style={{ margin: "0" }} />

          {/* ── Quantity Helper (Modern Pills + Integrated Stepper) ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <h2 style={{ color: "var(--fg)", fontSize: "0.98rem", fontWeight: 600 }}>
                {t(locale, "howMuch")}
              </h2>
              <button
                type="button"
                onClick={() => setSizeOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--price)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  textDecoration: "underline",
                }}
              >
                <RulerIcon size={15} />
                <span>{t(locale, "sizeGuide")}</span>
              </button>
            </div>

            {/* Garment pill selector */}
            <label style={labelStyle}>{t(locale, "garmentUse")}</label>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {sizeGuide.categories.map((c) => {
                const active = garment === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setGarment(c.key)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${active ? "var(--btn-bg)" : "var(--border)"}`,
                      backgroundColor: active ? "var(--btn-bg)" : "transparent",
                      color: active ? "var(--btn-fg)" : "var(--fg-body)",
                      fontSize: "0.82rem",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isAr ? c.labelAr : c.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Size pill selector */}
            <label style={labelStyle}>{t(locale, "chooseSize")}</label>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
              {activeCat.sizes.map((s) => {
                const active = size === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSize(s.size)}
                    style={{
                      padding: "0.4rem 0.7rem",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${active ? "var(--btn-bg)" : "var(--border)"}`,
                      backgroundColor: active ? "var(--btn-bg)" : "transparent",
                      color: active ? "var(--btn-fg)" : "var(--fg-body)",
                      fontSize: "0.78rem",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Integrated Stepper */}
            <label style={labelStyle}>{t(locale, "metersQty")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-card)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setMeters((m) => Math.max(0.5, +(m - 0.5).toFixed(1)))}
                  aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                  style={stepperBtn}
                >
                  <MinusIcon size={15} />
                </button>
                <span
                  style={{
                    minWidth: 68,
                    textAlign: "center",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--fg)",
                    padding: "0 0.5rem",
                  }}
                >
                  {meters} {isAr ? "م" : "m"}
                </span>
                <button
                  type="button"
                  onClick={() => setMeters((m) => +(m + 0.5).toFixed(1))}
                  aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                  style={stepperBtn}
                >
                  <PlusIcon size={15} />
                </button>
              </div>

              <span style={{ color: "var(--fg-muted)", fontSize: "0.78rem" }}>
                {t(locale, "minCut")}
              </span>
            </div>

            {/* Total price */}
            <div
              style={{
                marginTop: "1rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--fg-muted)", fontSize: "0.82rem" }}>
                {t(locale, "totalPrice")}
              </span>
              <span style={{ color: "var(--price)", fontSize: "1.1rem", fontWeight: 600 }}>
                {totalPrice ? totalPrice : t(locale, "demoPrice")}
              </span>
            </div>
          </div>

          {/* Primary + Secondary CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <button
              onClick={handleAddToCart}
              style={{
                width: "100%",
                minHeight: 50,
                background: added ? "rgba(100,200,100,0.18)" : "var(--btn-bg)",
                color: added ? "#6fca6f" : "var(--btn-fg)",
                border: added ? "1px solid #6fca6f" : "none",
                borderRadius: "var(--radius-sm)",
                padding: "0.9rem 1rem",
                fontSize: "0.95rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.25s ease",
              }}
            >
              {added && <CheckIcon size={18} />}
              <span>{added ? (isAr ? "أُضيف للسلة" : "Added to Cart") : t(locale, "addToCart")}</span>
            </button>

            <Link
              href={`/contact?type=tailoring&fabric=${encodeURIComponent(name)}`}
              style={{
                width: "100%",
                minHeight: 46,
                background: "transparent",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                fontSize: "0.88rem",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                transition: "background-color 0.2s ease",
              }}
            >
              {isAr ? "اطلب تفصيل أو استفسر عن السعر" : "Request Tailoring or Price Inquiry"}
            </Link>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal open={sizeOpen} onClose={() => setSizeOpen(false)} />

      {/* Zoom Lightbox Modal */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "عرض مكبر للقماش" : "Zoomed fabric view"}
          onClick={() => setZoomOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2500,
            backgroundColor: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            cursor: "zoom-out",
          }}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label={t(locale, "close")}
            style={{
              position: "absolute",
              top: 20,
              insetInlineEnd: 20,
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#EFEEEC",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <XIcon size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImgSrc}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "88vh",
              objectFit: "contain",
              borderRadius: "var(--radius-sm)",
              cursor: "default",
            }}
          />
        </div>
      )}

      {/* ── Similar fabrics (one indexed query on the server; nothing extra is fetched) ── */}
      {similar.length > 0 && (
        <section style={{ marginTop: "4rem" }} aria-labelledby="similar-heading">
          <h2 id="similar-heading" style={{ color: "var(--fg)", fontSize: "1.3rem", fontWeight: 400, letterSpacing: "0.04em", marginBottom: "1.25rem" }}>
            {isAr ? "أقمشة مشابهة" : "Similar fabrics"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem 1rem" }}>
            {similar.map((f) => (
              <FabricCard key={f.id} fabric={f} sizes="(max-width: 600px) 50vw, 240px" />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .detail-main-img:hover {
          transform: scale(1.04);
        }
        @media (max-width: 767px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--fg-muted)",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "0.45rem",
};

const stepperBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--fg)",
  width: 42,
  height: 42,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
