// Single fabric view — inspired by Mood Fabrics product page layout
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLang, useCart } from "@/components/Providers";
import { t } from "@/lib/i18n";
import SizeGuideModal from "@/components/SizeGuideModal";
import { sizeGuide } from "@/lib/demoData";
import type { Fabric } from "@/lib/demoData";

export default function FabricDetailPage() {
  const params = useParams();
  const { locale } = useLang();
  const { addItem } = useCart();
  const router = useRouter();

  const [fabric, setFabric] = useState<Fabric | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [meters, setMeters] = useState(1);
  const [garment, setGarment] = useState(sizeGuide.categories[0].key);
  const [size, setSize] = useState(sizeGuide.categories[0].sizes[0].size);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/fabrics/${params.id}`)
      .then((r) => r.json())
      .then((d: Fabric) => { setFabric(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params?.id]);

  // Sync meters when garment/size changes
  useEffect(() => {
    const cat = sizeGuide.categories.find((c) => c.key === garment);
    const sizeRow = cat?.sizes.find((s) => s.size === size);
    if (sizeRow && sizeRow.meters > 0) setMeters(sizeRow.meters);
  }, [garment, size]);

  if (loading) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "var(--fg-muted)" }}>
      {t(locale, "loading")}
    </div>
  );

  if (!fabric) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "var(--fg-muted)" }}>
      Fabric not found.
    </div>
  );

  const name = locale === "ar" ? fabric.nameAr : fabric.nameEn;
  const desc = locale === "ar" ? fabric.descriptionAr : fabric.descriptionEn;
  const hasPrice = fabric.pricePerMeter > 0;
  const hasStock = fabric.stockMeters > 0;
  const totalPrice = hasPrice ? (fabric.pricePerMeter * meters).toFixed(2) : null;

  // Size guide helper: active garment categories
  const activeCat = sizeGuide.categories.find((c) => c.key === garment) ?? sizeGuide.categories[0];

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
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Back link */}
      <Link href="/fabrics" style={{ color: "var(--fg-muted)", fontSize: "0.85rem", display: "inline-block", marginBottom: "1.5rem" }}>
        {t(locale, "backToFabrics")}
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }} className="detail-grid">
        {/* ── Photos ───────────────────────────────────── */}
        <div>
          {/* Main photo */}
          <div style={{
            backgroundColor: "#0a1525",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            aspectRatio: "4/5",
            marginBottom: "0.75rem",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fabric.photos[activePhoto]?.src ?? "/demo/fabric-draped-placeholder.svg"}
              alt={fabric.photos[activePhoto]?.alt ?? name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s ease" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%230e1a2e' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' fill='%23b8973e' text-anchor='middle' dy='.35em' font-size='14' font-family='serif'%3E⚠️ Demo Photo%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Thumbnail strip — horizontal, below main photo */}
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
                    border: `2px solid ${i === activePhoto ? "var(--price)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#0a1525",
                    transition: "border-color 0.25s ease",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.src}
                    alt={ph.alt}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info panel ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Name */}
          <div>
            <h1 style={{ color: "var(--fg)", fontSize: "1.8rem", fontWeight: 400, letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
              {name}
            </h1>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                locale === "ar" ? fabric.categoryLabel.ar : fabric.categoryLabel.en,
                locale === "ar" ? fabric.materialLabel.ar : fabric.materialLabel.en,
                locale === "ar" ? fabric.patternLabel.ar : fabric.patternLabel.en,
                locale === "ar" ? fabric.colorLabel.ar : fabric.colorLabel.en,
              ].map((tag) => (
                <span key={tag} style={{
                  background: "rgba(185,151,62,0.12)",
                  color: "var(--fg-muted)",
                  fontSize: "0.72rem",
                  padding: "3px 9px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="divider-gold" style={{ margin: "0" }} />

          {/* Price */}
          <div>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>
              {t(locale, "pricePerMeter")}
            </p>
            <p style={{ color: hasPrice ? "var(--fg)" : "#ffa040", fontSize: "1.4rem" }}>
              {hasPrice ? `${fabric.pricePerMeter.toFixed(2)}` : t(locale, "demoPrice")}
            </p>
          </div>

          {/* Stock */}
          <div style={{
            background: "rgba(185,151,62,0.08)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 1rem",
            fontSize: "0.85rem",
            color: hasStock ? "var(--fg-body)" : "#ffa040",
          }}>
            {hasStock
              ? `${t(locale, "stockLeft")}: ${fabric.stockMeters} ${t(locale, "meters")}`
              : t(locale, "demoStock")}
          </div>

          {/* Description */}
          <p style={{ color: "var(--fg-body)", lineHeight: 1.75, fontSize: "0.95rem" }}>{desc}</p>

          <div className="divider-gold" style={{ margin: "0" }} />

          {/* ── Quantity helper ─────────────────────────── */}
          <div>
            <h2 style={{ color: "var(--fg)", fontSize: "1rem", fontWeight: 400, letterSpacing: "0.06em", marginBottom: "1rem" }}>
              {t(locale, "howMuch")}
            </h2>

            {/* Garment selector */}
            <label style={labelStyle}>{t(locale, "garmentUse")}</label>
            <select
              value={garment}
              onChange={(e) => { setGarment(e.target.value); }}
              style={selectStyle}
            >
              {sizeGuide.categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {locale === "ar" ? c.labelAr : c.labelEn}
                </option>
              ))}
            </select>

            {/* Size selector */}
            <label style={{ ...labelStyle, marginTop: "0.75rem" }}>{t(locale, "chooseSize")}</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              style={selectStyle}
            >
              {activeCat.sizes.map((s) => (
                <option key={s.size} value={s.size}>{s.size}</option>
              ))}
            </select>

            {/* Size guide link */}
            <button
              onClick={() => setSizeOpen(true)}
              style={{
                background: "none", border: "none",
                color: "var(--accent)", cursor: "pointer",
                fontSize: "0.82rem", textDecoration: "underline",
                marginTop: "0.4rem", display: "block",
              }}
            >
              {t(locale, "sizeGuide")}
            </button>

            {/* Metres input */}
            <label style={{ ...labelStyle, marginTop: "0.75rem" }}>{t(locale, "metersQty")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => setMeters(m => Math.max(0.5, +(m - 0.5).toFixed(1)))}
                style={qtyBtn}
              >−</button>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={meters}
                onChange={(e) => setMeters(Math.max(0.5, +e.target.value))}
                style={{ ...selectStyle, width: 80, textAlign: "center", margin: 0 }}
              />
              <button
                onClick={() => setMeters(m => +(m + 0.5).toFixed(1))}
                style={qtyBtn}
              >+</button>
              <span style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>{t(locale, "meters")}</span>
            </div>

            {/* Min cut note */}
            <p style={{ color: "#ffa040", fontSize: "0.78rem", marginTop: "0.4rem" }}>
              {t(locale, "minCut")}
            </p>

            {/* Total price */}
            <div style={{
              marginTop: "1rem",
              background: "rgba(185,151,62,0.1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
            }}>
              <span style={{ color: "var(--fg-muted)", fontSize: "0.78rem" }}>{t(locale, "totalPrice")}: </span>
              <span style={{ color: totalPrice ? "var(--fg)" : "#ffa040", fontSize: "1.1rem" }}>
                {totalPrice ? totalPrice : t(locale, "demoPrice")}
              </span>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            style={{
              width: "100%",
              background: added
                ? "rgba(100,200,100,0.2)"
                : "var(--btn-bg)",
              color: added ? "#6fca6f" : "var(--btn-fg)",
              border: added ? "1px solid #6fca6f" : "none",
              borderRadius: "var(--radius-sm)",
              padding: "1rem",
              fontSize: "1rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
          >
            {added ? (locale === "ar" ? "✓ أُضيف للسلة" : "✓ Added to Cart") : t(locale, "addToCart")}
          </button>
        </div>
      </div>

      <SizeGuideModal open={sizeOpen} onClose={() => setSizeOpen(false)} />

      <style>{`
        @media (max-width: 767px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--fg-muted)",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "0.3rem",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--fg-body)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 0.75rem",
  fontSize: "0.9rem",
  cursor: "pointer",
};

const qtyBtn: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  borderRadius: "var(--radius-sm)",
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: "1.1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
