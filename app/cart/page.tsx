// Cart page
"use client";
import React from "react";
import Link from "next/link";
import { useLang, useCart } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function CartPage() {
  const { locale } = useLang();
  const { items, removeItem, total } = useCart();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        {t(locale, "cartTitle")}
      </h1>
      <div className="divider-gold" />

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p style={{ color: "var(--fg-muted)", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
            {t(locale, "cartEmpty")}
          </p>
          <Link href="/fabrics" style={{
            color: "var(--accent)",
            border: "1px solid var(--border)",
            padding: "0.6rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.9rem",
          }}>
            {t(locale, "continueShopping")}
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {items.map((item) => {
              const name = locale === "ar" ? item.fabricNameAr : item.fabricNameEn;
              const hasPrice = item.pricePerMeter > 0;
              return (
                <div key={item.fabricId} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "var(--fg)", fontWeight: 400, marginBottom: "0.25rem" }}>{name}</h3>
                    <p style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>
                      {item.meters} {t(locale, "meters")}
                      {hasPrice && ` × ${item.pricePerMeter.toFixed(2)}`}
                    </p>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <p style={{ color: hasPrice ? "var(--fg)" : "#ffa040", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                      {hasPrice ? (item.meters * item.pricePerMeter).toFixed(2) : t(locale, "demoPrice")}
                    </p>
                    <button
                      onClick={() => removeItem(item.fabricId)}
                      style={{
                        background: "none",
                        border: "1px solid var(--border)",
                        color: "var(--fg-muted)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.2rem 0.6rem",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        transition: "color 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#e55"; e.currentTarget.style.borderColor = "#e55"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                      {t(locale, "remove")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="divider-gold" />

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <span style={{ color: "var(--fg)", fontSize: "1.1rem" }}>{t(locale, "total")}</span>
            <span style={{ color: total > 0 ? "var(--fg)" : "#ffa040", fontSize: "1.3rem" }}>
              {total > 0 ? total.toFixed(2) : t(locale, "demoPrice")}
            </span>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Link href="/fabrics" style={{
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
              padding: "0.7rem 1.5rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
            }}>
              {t(locale, "continueShopping")}
            </Link>
            <Link href="/payment" style={{
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              padding: "0.7rem 2rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}>
              {t(locale, "checkout")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
