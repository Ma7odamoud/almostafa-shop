"use client";
import React, { useState } from "react";
import { useLang } from "@/lib/preferences/preferences";
import { sizeGuide } from "@/features/catalog/data/size-guide";
import { RulerIcon } from "@/components/ui/Icons";

export default function CareGuidePage() {
  const { locale } = useLang();
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, marginBottom: "0.5rem" }}>
        {isAr ? "دليل المقاسات والعناية بالأقمشة" : "Measurement & Fabric Care Guide"}
      </h1>
      <div className="divider-gold" />

      {/* Meterage Guide */}
      <section style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
          <span style={{ color: "var(--price)", display: "flex" }}>
            <RulerIcon size={20} />
          </span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--fg)" }}>
            {isAr ? "الأمتار الإرشادية للتفصيل" : "Approximate Tailoring Meterage"}
          </h2>
        </div>

        <p style={{ color: "var(--fg-muted)", fontSize: "0.88rem", marginBottom: "1.25rem", lineHeight: 1.7 }}>
          {isAr ? sizeGuide.note.ar : sizeGuide.note.en}
        </p>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {sizeGuide.categories.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "0.45rem 0.95rem",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${i === activeTab ? "var(--btn-bg)" : "var(--border)"}`,
                backgroundColor: i === activeTab ? "var(--btn-bg)" : "transparent",
                color: i === activeTab ? "var(--btn-fg)" : "var(--fg-body)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: i === activeTab ? 600 : 400,
              }}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={thStyle}>{isAr ? "المقاس" : "Size"}</th>
                <th style={thStyle}>{isAr ? "الأمتار المطلوبة (عرض 150 سم)" : "Metres Required (150cm width)"}</th>
              </tr>
            </thead>
            <tbody>
              {sizeGuide.categories[activeTab].sizes.map((row) => (
                <tr key={row.size} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={tdStyle}>{row.size}</td>
                  <td style={tdStyle}>
                    {row.meters} {isAr ? "متر" : "m"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fabric Care Instructions */}
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--fg)", marginBottom: "1.25rem" }}>
          {isAr ? "العناية بالخامات الفاخرة" : "Caring for Fine Fabrics"}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {[
            {
              titleAr: "الصوف الميرينو والتويد",
              titleEn: "Merino Wool & Tweed",
              descAr: "يُنظف بالتنظيف الجاف (Dry Clean) فقط. يُفضل تهوية البدلة على شماعة خشبية عريضة بعد كل ارتداء وتفريشها بفرشاة ناعمة.",
              descEn: "Dry clean only. Air your suit on a wide wooden hanger after wearing and brush gently with a soft garment brush.",
            },
            {
              titleAr: "الكتان الصافي",
              titleEn: "Pure Linen",
              descAr: "يُفضل الكي بالبخار وهو رطب قليلاً أو التنظيف الجاف للحفاظ على رونق الألياف الطبيعية ومنع الانكماش.",
              descEn: "Steam press while slightly damp or dry clean to preserve natural fibers and crisp structure.",
            },
            {
              titleAr: "الكاشمير",
              titleEn: "Cashmere",
              descAr: "تنظيف جاف لطيف أو حفظه مطوياً في مكان جاف بعيداً عن الرطوبة وأشعة الشمس المباشرة.",
              descEn: "Gentle dry clean only. Store folded in a breathable garment bag away from direct light.",
            },
          ].map((c) => (
            <div
              key={c.titleEn}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.6rem" }}>
                {isAr ? c.titleAr : c.titleEn}
              </h3>
              <p style={{ fontSize: "0.86rem", color: "var(--fg-muted)", lineHeight: 1.7 }}>
                {isAr ? c.descAr : c.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.85rem 1rem",
  textAlign: "start",
  fontSize: "0.78rem",
  color: "var(--fg-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.85rem 1rem",
  fontSize: "0.9rem",
  color: "var(--fg)",
};
