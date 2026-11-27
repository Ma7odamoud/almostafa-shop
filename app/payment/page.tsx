// Payment page — ⚠️ DEMO MODE — no real orders or payments
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang, useCart } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function PaymentPage() {
  const { locale } = useLang();
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", padding: "2rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#6fca6f" }}>✓</div>
        <h1 style={{ color: "var(--fg)", fontSize: "1.8rem", fontWeight: 400, marginBottom: "1rem" }}>
          {t(locale, "orderConfirm")}
        </h1>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          color: "var(--fg-body)",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          marginBottom: "2rem",
        }}>
          {t(locale, "orderConfirmMsg")}
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "0.8rem 2rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          {t(locale, "home")}
        </button>
      </div>
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t(locale, "nameRequired");
    if (!address.trim()) e.address = t(locale, "addressRequired");
    if (!method) e.method = t(locale, "methodRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total, name, address, paymentMethod: method }),
      });
    } catch {
      // Even on error, show demo confirmation
    }
    clearCart();
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        {t(locale, "paymentTitle")}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "3rem" }} className="pay-grid">
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Field
            label={t(locale, "yourName")}
            value={name}
            onChange={setName}
            error={errors.name}
          />
          <Field
            label={t(locale, "yourAddress")}
            value={address}
            onChange={setAddress}
            error={errors.address}
            multiline
          />

          {/* Payment method */}
          <div>
            <label style={labelStyle}>{t(locale, "paymentMethod")}</label>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
              {t(locale, "paymentNote")}
            </p>
            {[
              { value: "cod", labelAr: "الدفع عند الاستلام", labelEn: "Cash on Delivery" },
              { value: "bank-transfer", labelAr: "تحويل بنكي / إنستا باي", labelEn: "Bank Transfer / InstaPay" },
              { value: "card", labelAr: "بطاقة ائتمان / دفع إلكتروني", labelEn: "Credit Card / Online Payment" },
            ].map((opt) => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="method"
                  value={opt.value}
                  checked={method === opt.value}
                  onChange={() => setMethod(opt.value)}
                  style={{ accentColor: "var(--btn-bg)" }}
                />
                <span style={{ color: "var(--fg-body)", fontSize: "0.9rem" }}>
                  {locale === "ar" ? opt.labelAr : opt.labelEn}
                </span>
              </label>
            ))}
            {errors.method && <p style={{ color: "#e55", fontSize: "0.78rem" }}>{errors.method}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || items.length === 0}
            style={{
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: items.length === 0 ? "not-allowed" : "pointer",
              opacity: items.length === 0 ? 0.5 : 1,
              textTransform: "uppercase",
            }}
          >
            {submitting ? t(locale, "loading") : t(locale, "placeOrder")}
          </button>
        </form>

        {/* Order summary */}
        <div>
          <h2 style={{ color: "var(--fg)", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
            {t(locale, "orderSummary")}
          </h2>
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
          }}>
            {items.length === 0 ? (
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>{t(locale, "cartEmpty")}</p>
            ) : (
              <>
                {items.map((item) => {
                  const name = locale === "ar" ? item.fabricNameAr : item.fabricNameEn;
                  return (
                    <div key={item.fabricId} style={{
                      display: "flex", justifyContent: "space-between",
                      borderBottom: "1px solid var(--border)",
                      padding: "0.6rem 0",
                      gap: "0.5rem",
                    }}>
                      <div>
                        <p style={{ color: "var(--fg-body)", fontSize: "0.88rem" }}>{name}</p>
                        <p style={{ color: "var(--fg-muted)", fontSize: "0.75rem" }}>
                          {item.meters} {t(locale, "meters")}
                        </p>
                      </div>
                      <span style={{ color: "var(--price)", fontSize: "0.9rem" }}>
                        {item.pricePerMeter > 0 ? (item.meters * item.pricePerMeter).toFixed(2) : "—"}
                      </span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                  <span style={{ color: "var(--fg)", fontWeight: 500 }}>{t(locale, "total")}</span>
                  <span style={{ color: "var(--price)", fontSize: "1.1rem" }}>
                    {total > 0 ? total.toFixed(2) : t(locale, "demoPrice")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .pay-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, error, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
}) {
  const style: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-card)",
    border: `1px solid ${error ? "#e55" : "var(--border)"}`,
    color: "var(--fg-body)",
    borderRadius: "var(--radius-sm)",
    padding: "0.6rem 0.75rem",
    fontSize: "0.9rem",
    resize: multiline ? "vertical" : undefined,
    minHeight: multiline ? 80 : undefined,
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} style={style} rows={3} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={style} />
      )}
      {error && <p style={{ color: "#e55", fontSize: "0.78rem", marginTop: "0.25rem" }}>{error}</p>}
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
