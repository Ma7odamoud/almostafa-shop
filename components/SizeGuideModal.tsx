"use client";
import React, { useState } from "react";
import { useLang } from "./Providers";
import { t } from "@/lib/i18n";
import { sizeGuide } from "@/lib/demoData";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ open, onClose }: Props) {
  const { locale } = useLang();
  const [activeTab, setActiveTab] = useState(0);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          maxWidth: 580,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "2rem",
          animation: "fadeIn 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "var(--fg)", fontSize: "1.2rem" }}>
            {t(locale, "sizeGuide")}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", fontSize: "1.3rem" }}
          >
            ✕
          </button>
        </div>

        {/* Note */}
        <p style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "0.75rem 1rem",
          color: "var(--fg-muted)",
          fontSize: "0.82rem",
          marginBottom: "1.5rem",
          lineHeight: 1.6,
        }}>
          {locale === "ar" ? sizeGuide.note.ar : sizeGuide.note.en}
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {sizeGuide.categories.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${i === activeTab ? "var(--btn-bg)" : "var(--border)"}`,
                background: i === activeTab ? "var(--btn-bg)" : "transparent",
                color: i === activeTab ? "var(--btn-fg)" : "var(--fg-muted)",
                cursor: "pointer",
                fontSize: "0.82rem",
                transition: "all 0.2s ease",
              }}
            >
              {locale === "ar" ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={th}>{locale === "ar" ? "المقاس" : "Size"}</th>
              <th style={th}>{locale === "ar" ? "الأمتار المطلوبة" : "Metres required"}</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.categories[activeTab].sizes.map((row) => (
              <tr key={row.size} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={td}>{row.size}</td>
                <td style={{ ...td, color: row.meters === 0 ? "#ffa040" : "var(--fg-body)" }}>
                  {row.meters === 0
                    ? (locale === "ar" ? "⚠️ لم يُحدَّد بعد" : "⚠️ Not set yet")
                    : `${row.meters} ${t(locale, "meters")}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              background: "var(--gold-light)",
              color: "var(--navy-deep)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.6rem 1.5rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {t(locale, "close")}
          </button>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "start",
  color: "var(--fg-muted)",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  padding: "0.5rem 0.75rem",
};

const td: React.CSSProperties = {
  color: "var(--fg-body)",
  fontSize: "0.9rem",
  padding: "0.6rem 0.75rem",
};
