"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/components/Providers";

export default function AboutPage() {
  const { locale } = useLang();
  const isAr = locale === "ar";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            display: "block",
            marginBottom: "0.75rem",
          }}
        >
          {isAr ? "دار المصطفى" : "OUR HERITAGE"}
        </span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 400, color: "var(--fg)", marginBottom: "1rem" }}>
          {isAr ? "أصالة الأقمشة وحرفية التفصيل في قلب القاهرة" : "Fine Cloth & Bespoke Craft in Downtown Cairo"}
        </h1>
        <div className="divider-gold" style={{ maxWidth: 200, margin: "1.5rem auto" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", fontSize: "0.98rem", lineHeight: 1.85, color: "var(--fg-body)" }}>
        <p>
          {isAr
            ? "بدأت دار المصطفى برؤية بسيطة وواضحة: تقديم تجربة هادئة وموثوقة لاختيار أرقى الأقمشة الرجالية وتفصيلها بعناية فائقة، بعيداً عن التعقيد والتسرع."
            : "Al-Mostafa was founded with a clear, calm philosophy: to offer discerning gentlemen a trusted destination for fine suiting, jacketing, and shirting fabrics paired with dedicated bespoke tailoring."}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            margin: "1rem 0",
          }}
        >
          {[
            {
              titleAr: "انتقاء الخامات",
              titleEn: "Curated Mills",
              descAr: "ننتقي أقمشة الصوف الميرينو، الكتان الصافي، والكاشمير بعناية لتناسب أجواء العمل والمناسبات الرسمية.",
              descEn: "We carefully curate merino wool, breathable linen, and rich cashmere blends suited for year-round wear and formal occasions.",
            },
            {
              titleAr: "تجربة شراء واضحة",
              titleEn: "Effortless Selection",
              descAr: "نوفر لك حرية شراء القماش بالمتر وفق احتياج خياطك أو حجز موعد لتفصيله مباشرة داخل دارنا.",
              descEn: "Order fabric precisely by the meter for your personal tailor, or book an appointment for full bespoke tailoring.",
            },
            {
              titleAr: "موقعنا في وسط البلد",
              titleEn: "Downtown Cairo Atelier",
              descAr: "نستقبلكم في قلب القاهرة لمعاينة الأقمشة على الطبيعة وملمسها وأخذ المقاسات بدقة.",
              descEn: "Visit our Downtown Cairo showroom to experience fabric drape and texture in person and receive personal guidance.",
            },
          ].map((card) => (
            <div
              key={card.titleEn}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.6rem" }}>
                {isAr ? card.titleAr : card.titleEn}
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--fg-muted)", lineHeight: 1.7 }}>
                {isAr ? card.descAr : card.descEn}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Link
            href="/fabrics"
            style={{
              minHeight: 46,
              padding: "0 24px",
              backgroundColor: "var(--btn-bg)",
              color: "var(--btn-fg)",
              borderRadius: "var(--radius-sm)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {isAr ? "تصفح الأقمشة" : "Browse Fabrics"}
          </Link>
          <Link
            href="/bespoke"
            style={{
              minHeight: 46,
              padding: "0 24px",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              borderRadius: "var(--radius-sm)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            {isAr ? "خدمة التفصيل" : "Bespoke Tailoring"}
          </Link>
        </div>
      </div>
    </div>
  );
}
