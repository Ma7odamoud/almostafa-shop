// Cart page with inline quantity stepper
"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/lib/preferences/preferences";
import { useCart } from "@/features/cart/cart-context";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";

export default function CartPage() {
  const { locale } = useLang();
  const { items, updateItemMeters, removeItem, total } = useCart();
  const isAr = locale === "ar";

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
              const name = isAr ? item.fabricNameAr : item.fabricNameEn;
              const hasPrice = item.pricePerMeter > 0;
              return (
                <div key={item.fabricId} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem 1.25rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <Link href={`/fabrics/${item.fabricId}`} style={{ color: "var(--fg)", fontWeight: 500, fontSize: "1.02rem", display: "inline-block", marginBottom: "0.35rem" }}>
                      {name}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--bg)",
                      }}>
                        <button
                          type="button"
                          onClick={() => updateItemMeters(item.fabricId, Math.max(0.5, item.meters - 0.5))}
                          aria-label={isAr ? "تقليل الأمتار" : "Decrease meters"}
                          style={{ background: "none", border: "none", color: "var(--fg)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <MinusIcon size={13} />
                        </button>
                        <span style={{ minWidth: 52, textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "var(--fg)" }}>
                          {item.meters} {isAr ? "م" : "m"}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemMeters(item.fabricId, item.meters + 0.5)}
                          aria-label={isAr ? "زيادة الأمتار" : "Increase meters"}
                          style={{ background: "none", border: "none", color: "var(--fg)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <PlusIcon size={13} />
                        </button>
                      </div>
                      {hasPrice && (
                        <span style={{ color: "var(--fg-muted)", fontSize: "0.82rem" }}>
                          × {formatPrice(item.pricePerMeter, locale)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <p style={{ color: "var(--price)", fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                      {hasPrice ? formatPrice(item.meters * item.pricePerMeter, locale) : t(locale, "demoPrice")}
                    </p>
                    <button
                      onClick={() => removeItem(item.fabricId)}
                      style={{
                        background: "none",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--fg-muted)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.25rem 0.65rem",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        transition: "color 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#e55"; e.currentTarget.style.borderColor = "#e55"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                    >
                      {t(locale, "remove")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="divider-gold" />

          {/* Delivery */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
            <span style={{ color: "var(--fg-body)", fontSize: "0.95rem" }}>{t(locale, "deliveryFee")}</span>
            <span style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>{t(locale, "deliveryFeeTbc")}</span>
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "var(--fg)", fontSize: "1.1rem" }}>{t(locale, "total")}</span>
            <span style={{ color: "var(--price)", fontSize: "1.3rem", fontWeight: 600 }}>
              {total > 0 ? formatPrice(total, locale) : t(locale, "demoPrice")}
            </span>
          </div>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            {t(locale, "deliveryNote")}
          </p>

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
