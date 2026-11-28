// Checkout page. Orders are priced by the backend and confirmed by phone before dispatch.
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/preferences/preferences";
import { useCart } from "@/features/cart/cart-context";
import { t, type TranslationKey } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { ordersService, type CheckoutOptions } from "@/features/checkout/services/orders";
import { ApiError, errorMessage } from "@/lib/api/errors";

// Same rule as the backend: 010 / 011 / 012 / 015 mobiles, with optional +20 / 0020 prefix and separators.
const EGYPT_MOBILE = /^(?:\+?20|0020)?0?1[0125]\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toAsciiDigits(value: string) {
  return value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

interface Confirmation { orderId: string; phone: string }

export default function PaymentPage() {
  const { locale } = useLang();
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // One key per checkout attempt; kept across retries so a resubmission can never create a second order.
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    ordersService.options(controller.signal).then(setOptions).catch(() => {});
    return () => controller.abort();
  }, []);

  if (confirmation) {
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
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: "0.2rem" }}>{t(locale, "orderNumber")}</p>
            <p style={{ color: "var(--fg)", fontSize: "1.2rem", letterSpacing: "0.04em", direction: "ltr" }}>{confirmation.orderId}</p>
          </div>
          <p>{t(locale, "orderConfirmMsg")}</p>
          <p style={{ color: "var(--fg-muted)" }}>
            {t(locale, "orderNextStep").replace("{phone}", confirmation.phone)}
          </p>
        </div>
        <button onClick={() => router.push("/fabrics")} style={primaryBtn}>
          {t(locale, "continueShopping")}
        </button>
      </div>
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    const phoneDigits = toAsciiDigits(phone).replace(/[\s\-().]/g, "");
    if (!name.trim()) e.name = t(locale, "nameRequired");
    if (!phoneDigits) e.phone = t(locale, "phoneRequired");
    else if (!EGYPT_MOBILE.test(phoneDigits)) e.phone = t(locale, "phoneInvalid");
    if (email.trim() && !EMAIL.test(email.trim())) e.email = t(locale, "emailInvalid");
    if (!governorate) e.governorate = t(locale, "governorateRequired");
    if (!area.trim()) e.area = t(locale, "areaRequired");
    if (!address.trim()) e.address = t(locale, "addressRequired");
    if (!method) e.method = t(locale, "methodRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;
    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmitError("");
    try {
      // Only ids and quantities are sent; the server prices the order from the catalogue.
      const result = await ordersService.place({
        items: items.map((i) => ({ fabricId: i.fabricId, meters: i.meters })),
        name,
        phone,
        email: email.trim() || null,
        governorate,
        area,
        address,
        paymentMethod: method,
      }, idempotencyKey.current);
      idempotencyKey.current = null;
      clearCart();
      setConfirmation({ orderId: result.orderId, phone: toAsciiDigits(phone).trim() });
      window.scrollTo({ top: 0 });
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        // Show the server's field messages next to the matching inputs.
        const fieldErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.fieldErrors)) fieldErrors[field === "paymentMethod" ? "method" : field] = messages[0];
        setErrors(fieldErrors);
      }
      setSubmitError(
        err instanceof ApiError && err.code === "fabric_unavailable"
          ? (locale === "ar"
              ? "بعض الأقمشة في سلتك لم تعد متاحة. يرجى تحديث السلة ثم المحاولة مرة أخرى."
              : "Some fabrics in your cart are no longer available. Please update your cart and try again.")
          : errorMessage(err, locale)
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isAr = locale === "ar";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        {t(locale, "paymentTitle")}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "3rem", alignItems: "start" }} className="pay-grid">
        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} className="pay-form">
          <Field id="name" label={t(locale, "yourName")} value={name} onChange={setName} error={errors.name} autoComplete="name" />
          <Field
            id="phone"
            label={t(locale, "yourPhone")}
            hint={t(locale, "phoneHint")}
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            ltr
          />
          <Field id="email" label={t(locale, "yourEmail")} value={email} onChange={setEmail} error={errors.email} type="email" autoComplete="email" ltr />

          {/* Delivery */}
          <div>
            <label htmlFor="governorate" style={labelStyle}>{t(locale, "governorate")}</label>
            <select
              id="governorate"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              style={{ ...inputStyle(!!errors.governorate), appearance: "auto" }}
              autoComplete="address-level1"
            >
              <option value="">{isAr ? "اختر المحافظة" : "Select governorate"}</option>
              {(options?.governorates ?? []).map((g) => (
                <option key={g.value} value={g.value}>{isAr ? g.labelAr : g.labelEn}</option>
              ))}
            </select>
            <p style={hintStyle}>{t(locale, "deliveryAreasNote")}</p>
            {errors.governorate && <p style={errorStyle}>{errors.governorate}</p>}
          </div>
          <Field id="area" label={t(locale, "area")} value={area} onChange={setArea} error={errors.area} autoComplete="address-level2" />
          <Field id="address" label={t(locale, "yourAddress")} value={address} onChange={setAddress} error={errors.address} multiline autoComplete="street-address" />

          {/* Payment method */}
          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend style={labelStyle}>{t(locale, "paymentMethod")}</legend>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
              {(options?.paymentMethods ?? []).map((opt) => {
                const selected = method === opt.value;
                return (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      gap: "0.7rem",
                      alignItems: "flex-start",
                      cursor: "pointer",
                      padding: "0.75rem 0.9rem",
                      border: `1px solid ${selected ? "var(--fg-muted)" : "var(--border)"}`,
                      borderRadius: "var(--radius-sm)",
                      background: selected ? "var(--bg-card)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setMethod(opt.value)}
                      style={{ accentColor: "var(--btn-bg)", marginTop: "0.25rem" }}
                    />
                    <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      <span style={{ color: "var(--fg-body)", fontSize: "0.92rem" }}>{isAr ? opt.labelAr : opt.labelEn}</span>
                      <span style={{ color: "var(--fg-muted)", fontSize: "0.78rem", lineHeight: 1.5 }}>
                        {t(locale, `payNote_${opt.value}` as TranslationKey)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.method && <p style={errorStyle}>{errors.method}</p>}
          </fieldset>

          {submitError && (
            <p role="alert" style={{ color: "#e55", fontSize: "0.85rem" }}>{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || items.length === 0}
            style={{
              ...primaryBtn,
              padding: "1rem",
              fontSize: "1rem",
              letterSpacing: "0.08em",
              cursor: items.length === 0 ? "not-allowed" : "pointer",
              opacity: items.length === 0 ? 0.5 : 1,
              textTransform: "uppercase",
            }}
          >
            {submitting ? t(locale, "loading") : t(locale, "placeOrder")}
          </button>
        </form>

        {/* Order summary — shown first on phones so customers see what they are ordering */}
        <aside className="pay-summary">
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
                  const itemName = isAr ? item.fabricNameAr : item.fabricNameEn;
                  return (
                    <div key={item.fabricId} style={{
                      display: "flex", justifyContent: "space-between",
                      borderBottom: "1px solid var(--border)",
                      padding: "0.6rem 0",
                      gap: "0.5rem",
                    }}>
                      <div>
                        <p style={{ color: "var(--fg-body)", fontSize: "0.88rem" }}>{itemName}</p>
                        <p style={{ color: "var(--fg-muted)", fontSize: "0.75rem" }}>
                          {item.meters} {t(locale, "meters")}
                        </p>
                      </div>
                      <span style={{ color: "var(--price)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                        {item.pricePerMeter > 0 ? formatPrice(item.meters * item.pricePerMeter, locale) : "—"}
                      </span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border)", gap: "0.5rem" }}>
                  <span style={{ color: "var(--fg-body)", fontSize: "0.88rem" }}>{t(locale, "deliveryFee")}</span>
                  <span style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>{t(locale, "deliveryFeeTbc")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", gap: "0.5rem" }}>
                  <span style={{ color: "var(--fg)", fontWeight: 500 }}>{t(locale, "total")}</span>
                  <span style={{ color: "var(--price)", fontSize: "1.1rem" }}>
                    {total > 0 ? formatPrice(total, locale) : t(locale, "demoPrice")}
                  </span>
                </div>
                <p style={{ ...hintStyle, marginTop: "0.9rem" }}>{t(locale, "deliveryNote")}</p>
              </>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .pay-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .pay-summary { order: -1; }
        }
      `}</style>
    </div>
  );
}

function Field({ id, label, hint, value, onChange, error, multiline, type = "text", inputMode, autoComplete, placeholder, ltr }: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
  ltr?: boolean;
}) {
  const style: React.CSSProperties = {
    ...inputStyle(!!error),
    resize: multiline ? "vertical" : undefined,
    minHeight: multiline ? 80 : undefined,
    direction: ltr ? "ltr" : undefined,
    textAlign: ltr ? "start" : undefined,
  };
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} style={style} rows={3} autoComplete={autoComplete} aria-invalid={!!error} />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={style}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
        />
      )}
      {hint && !error && <p style={hintStyle}>{hint}</p>}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: "var(--bg-card)",
    border: `1px solid ${hasError ? "#e55" : "var(--border)"}`,
    color: "var(--fg-body)",
    borderRadius: "var(--radius-sm)",
    padding: "0.6rem 0.75rem",
    fontSize: "1rem",
  };
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--fg-muted)",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "0.3rem",
};

const hintStyle: React.CSSProperties = { color: "var(--fg-muted)", fontSize: "0.78rem", marginTop: "0.3rem", lineHeight: 1.5 };
const errorStyle: React.CSSProperties = { color: "#e55", fontSize: "0.78rem", marginTop: "0.25rem" };

const primaryBtn: React.CSSProperties = {
  background: "var(--btn-bg)",
  color: "var(--btn-fg)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "0.8rem 2rem",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "0.95rem",
};
