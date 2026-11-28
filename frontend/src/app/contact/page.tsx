// Contact & Tailoring Appointment page
"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/preferences/preferences";
import { t } from "@/lib/i18n";
import { CheckIcon, ClockIcon, EnvelopeIcon, MapPinIcon } from "@/components/ui/Icons";

function ContactContent() {
  const { locale } = useLang();
  const searchParams = useSearchParams();
  const isAr = locale === "ar";

  const initialType = searchParams.get("type") === "tailoring" ? "tailoring" : "inquiry";
  const initialFabric = searchParams.get("fabric") ?? "";

  const [mode, setMode] = useState<"inquiry" | "tailoring">(initialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [garmentType, setGarmentType] = useState("suit");
  const [preferredDate, setPreferredDate] = useState("");
  const [fabricInterest, setFabricInterest] = useState(initialFabric);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Intentional: re-sync local UI state when the URL / selection changes (pre-existing behaviour).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (searchParams.get("type") === "tailoring") setMode("tailoring");
    const fab = searchParams.get("fabric");
    if (fab) setFabricInterest(fab);
  }, [searchParams]);

  function buildMailtoHref() {
    const subject =
      mode === "tailoring"
        ? `Tailoring Request — ${name || "Customer"}`
        : `Inquiry — ${name || "Customer"}`;
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      mode === "tailoring" ? `Garment: ${garmentType}` : null,
      mode === "tailoring" && fabricInterest ? `Fabric: ${fabricInterest}` : null,
      mode === "tailoring" && preferredDate ? `Preferred Date: ${preferredDate}` : null,
      "",
      message,
    ]
      .filter((x) => x !== null)
      .join("\n");

    return `mailto:contactalmostafainfo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem 3.5rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        {t(locale, "contactTitle")}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "3rem" }} className="contact-grid">
        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <InfoBlock icon={<EnvelopeIcon size={20} />} label={t(locale, "contactEmail")}>
            <a
              href="mailto:contactalmostafainfo@gmail.com"
              style={{ color: "var(--fg)", fontSize: "0.95rem", textDecoration: "underline", wordBreak: "break-all" }}
            >
              contactalmostafainfo@gmail.com
            </a>
          </InfoBlock>
          <InfoBlock icon={<MapPinIcon size={20} />} label={t(locale, "contactAddress")}>
            <span style={{ color: "var(--fg)", fontSize: "0.95rem" }}>
              {isAr ? "وسط البلد، القاهرة، مصر" : "Downtown Cairo, Egypt"}
            </span>
          </InfoBlock>
          <InfoBlock icon={<ClockIcon size={20} />} label={t(locale, "contactHours")}>
            <span style={{ color: "var(--fg)", fontSize: "0.95rem" }}>
              {isAr ? "السبت – الخميس: 10:00 ص – 10:00 م" : "Sat – Thu: 10:00 AM – 10:00 PM"}
            </span>
          </InfoBlock>
        </div>

        {/* Contact / Tailoring form */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "2rem",
          }}
        >
          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {[
              { key: "inquiry" as const, ar: "استفسار عام", en: "General Inquiry" },
              { key: "tailoring" as const, ar: "حجز موعد / طلب تفصيل", en: "Tailoring Appointment" },
            ].map((tab) => {
              const active = mode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setMode(tab.key);
                    setSent(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${active ? "var(--btn-bg)" : "var(--border)"}`,
                    backgroundColor: active ? "var(--btn-bg)" : "transparent",
                    color: active ? "var(--btn-fg)" : "var(--fg-body)",
                    fontSize: "0.84rem",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isAr ? tab.ar : tab.en}
                </button>
              );
            })}
          </div>

          {sent ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "var(--fg)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(100, 200, 100, 0.15)",
                  color: "#6fca6f",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.85rem",
                }}
              >
                <CheckIcon size={24} />
              </div>
              <p style={{ marginBottom: "1.25rem", lineHeight: 1.7 }}>{t(locale, "messageSent")}</p>
              <a
                href={buildMailtoHref()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.65rem 1.25rem",
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-fg)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <EnvelopeIcon size={16} />
                <span>{isAr ? "إرسال عبر تطبيق البريد" : "Open in Email App"}</span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FormField
                label={isAr ? "الاسم" : "Name"}
                value={name}
                onChange={setName}
                type="text"
                required
              />
              <FormField
                label={isAr ? "البريد الإلكتروني" : "Email"}
                value={email}
                onChange={setEmail}
                type="email"
                required
              />

              {mode === "tailoring" && (
                <>
                  <div>
                    <label style={labelStyle}>{isAr ? "نوع التفصيل المطلوب" : "Garment Type"}</label>
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                      {[
                        { key: "suit", ar: "بدلة كاملة", en: "Full Suit" },
                        { key: "jacket", ar: "جاكيت", en: "Jacket" },
                        { key: "trousers", ar: "بنطلون", en: "Trousers" },
                        { key: "coat", ar: "معطف", en: "Coat" },
                      ].map((g) => {
                        const active = garmentType === g.key;
                        return (
                          <button
                            key={g.key}
                            type="button"
                            onClick={() => setGarmentType(g.key)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "var(--radius-sm)",
                              border: `1px solid ${active ? "var(--btn-bg)" : "var(--border)"}`,
                              backgroundColor: active ? "var(--btn-bg)" : "transparent",
                              color: active ? "var(--btn-fg)" : "var(--fg-body)",
                              fontSize: "0.8rem",
                              fontWeight: active ? 600 : 400,
                              cursor: "pointer",
                            }}
                          >
                            {isAr ? g.ar : g.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <FormField
                    label={isAr ? "القماش المختار (اختياري)" : "Selected Fabric (Optional)"}
                    value={fabricInterest}
                    onChange={setFabricInterest}
                    type="text"
                  />

                  <FormField
                    label={isAr ? "الموعد المفضل للزيارة" : "Preferred Appointment Date"}
                    value={preferredDate}
                    onChange={setPreferredDate}
                    type="date"
                  />
                </>
              )}

              <div>
                <label style={labelStyle}>{t(locale, "yourMessage")}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
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

              <button
                type="submit"
                style={{
                  background: "var(--btn-bg)",
                  color: "var(--btn-fg)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.85rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                {mode === "tailoring"
                  ? isAr
                    ? "تأكيد طلب التفصيل"
                    : "Request Appointment"
                  : t(locale, "send")}
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>...</div>}>
      <ContactContent />
    </Suspense>
  );
}

function InfoBlock({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      <span style={{ color: "var(--price)", display: "flex", marginTop: "2px" }}>{icon}</span>
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
