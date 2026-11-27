// Contact page — ⚠️ contact details are placeholder
"use client";
import React, { useState } from "react";
import { useLang } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function ContactPage() {
  const { locale } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ⚠️ DEMO — no real email is sent. Contact form backend not configured.
    setSent(true);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        {t(locale, "contactTitle")}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "3rem" }} className="contact-grid">
        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <InfoBlock icon="📧" label={t(locale, "contactEmail")}>
            <a
              href="mailto:contactalmostafainfo@gmail.com"
              style={{ color: "var(--fg)", fontSize: "0.95rem", textDecoration: "underline", wordBreak: "break-all" }}
            >
              contactalmostafainfo@gmail.com
            </a>
          </InfoBlock>
          <InfoBlock icon="📍" label={t(locale, "contactAddress")}>
            <span style={{ color: "var(--fg)", fontSize: "0.95rem" }}>
              {locale === "ar" ? "وسط البلد، القاهرة، مصر" : "Downtown Cairo, Egypt"}
            </span>
          </InfoBlock>
          <InfoBlock icon="🕐" label={t(locale, "contactHours")}>
            <span style={{ color: "var(--fg)", fontSize: "0.95rem" }}>
              {locale === "ar" ? "السبت – الخميس: 10:00 ص – 10:00 م" : "Sat – Thu: 10:00 AM – 10:00 PM"}
            </span>
          </InfoBlock>
        </div>

        {/* Contact form */}
        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "2rem",
        }}>
          <h2 style={{ color: "var(--fg)", fontSize: "1.1rem", fontWeight: 400, marginBottom: "1.5rem" }}>
            {t(locale, "contactFormTitle")}
          </h2>

          {sent ? (
            <div style={{
              textAlign: "center",
              padding: "2rem",
              color: "#6fca6f",
              background: "rgba(100,200,100,0.08)",
              border: "1px solid rgba(100,200,100,0.3)",
              borderRadius: "var(--radius-sm)",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
              <p>{t(locale, "messageSent")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FormField
                label={locale === "ar" ? "الاسم" : "Name"}
                value={name}
                onChange={setName}
                type="text"
                required
              />
              <FormField
                label={locale === "ar" ? "البريد الإلكتروني" : "Email"}
                value={email}
                onChange={setEmail}
                type="email"
                required
              />
              <div>
                <label style={labelStyle}>{t(locale, "yourMessage")}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  style={{
                    width: "100%",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-body)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.6rem 0.75rem",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>
              <button type="submit" style={{
                background: "var(--btn-bg)",
                color: "var(--btn-fg)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "0.85rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}>
                {t(locale, "send")}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function InfoBlock({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      <span style={{ fontSize: "1.3rem" }}>{icon}</span>
      <div>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.2rem" }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type, required }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: "100%",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          color: "var(--fg-body)",
          borderRadius: "var(--radius-sm)",
          padding: "0.6rem 0.75rem",
          fontSize: "0.9rem",
        }}
      />
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
