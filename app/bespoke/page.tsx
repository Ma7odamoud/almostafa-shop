"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/components/Providers";
import { CheckIcon, ClockIcon, MapPinIcon, RulerIcon } from "@/components/Icons";

export default function BespokePage() {
  const { locale } = useLang();
  const isAr = locale === "ar";

  const customizations = [
    {
      titleAr: "اللياقة والقَصّة",
      titleEn: "Lapels & Silhouette",
      descAr: "لياقة مدببة (Peak)، كلاسيكية (Notch)، أو شال، مع قصة كلاسيكية أو Slim Fit مريحة.",
      descEn: "Peak, Notch, or Shawl lapels paired with a classic structured or contemporary tailored silhouette.",
    },
    {
      titleAr: "البطانة والأزرار",
      titleEn: "Linings & Buttons",
      descAr: "بطانات حرير/كوبرو فاخرة وأزرار طبيعية (Horn / Mother of Pearl) بتناسق تام مع القماش.",
      descEn: "Breathable Bemberg linings and natural horn or corozo buttons matched to your cloth.",
    },
    {
      titleAr: "البروفات والضبط",
      titleEn: "Fittings & Precision",
      descAr: "أخذ المقاسات يدوياً في معرض وسط البلد مع بروفة لضمان انسيابية الكتف والظهر.",
      descEn: "Hand-taken measurements at our Downtown Cairo atelier with dedicated fittings for shoulder and drape.",
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      {/* Editorial Header */}
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 3rem" }}>
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
          {isAr ? "تفصيل حسب الطلب · وسط البلد" : "BESPOKE TAILORING · DOWNTOWN CAIRO"}
        </span>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.75rem)",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: "1rem",
            lineHeight: 1.25,
          }}
        >
          {isAr ? "بدلة مفصّلة على مقاسك وذوقك" : "Crafted to Your Exact Silhouette"}
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.98rem", lineHeight: 1.8 }}>
          {isAr
            ? "في دار المصطفى، نجمع بين أرقى الأقمشة الرجالية وخبرة الخياطة الكلاسيكية لنقدم لك بدلة أو جاكيت يعكس شخصيتك بأعلى درجات الراحة والأناقة."
            : "At Al-Mostafa, we pair fine menswear cloth with classic tailoring mastery to craft garments tailored to your exact proportions and personal style."}
        </p>
      </div>

      {/* 3 Pillars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3.5rem",
        }}
      >
        {customizations.map((item) => (
          <div
            key={item.titleEn}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "1.75rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.75rem" }}>
              {isAr ? item.titleAr : item.titleEn}
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {isAr ? item.descAr : item.descEn}
            </p>
          </div>
        ))}
      </div>

      {/* What's Included + Timeline */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "2.25rem",
          marginBottom: "3rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 500, color: "var(--fg)", marginBottom: "1rem" }}>
            {isAr ? "ما الذي تشمله جلسة التفصيل؟" : "What to Expect at Your Appointment"}
          </h2>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              isAr ? "استشارة لاختيار القماش الأنسب للمناسبة والموسم" : "Personal consultation to choose the ideal cloth for season and occasion",
              isAr ? "أخذ أكثر من 20 قياساً دقيقاً للبدلة أو القميص" : "Precision manual measurements for jacket, trousers, or waistcoat",
              isAr ? "تحديد تفاصيل اللياقة، الجيوب، والبطانة الداخلية" : "Custom selection of lapels, pockets, vents, and interior lining",
              isAr ? "بروفة نهائية وضبط مجاني قبل التسليم" : "Final fitting and complimentary adjustments prior to handover",
            ].map((point) => (
              <li
                key={point}
                style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--fg-body)", fontSize: "0.9rem" }}
              >
                <span style={{ color: "var(--price)", marginTop: "2px", flexShrink: 0 }}>
                  <CheckIcon size={16} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg)", fontSize: "0.9rem" }}>
            <MapPinIcon size={18} />
            <span>{isAr ? "معرض المصطفى — وسط البلد، القاهرة" : "Al-Mostafa Atelier — Downtown Cairo"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg-muted)", fontSize: "0.88rem" }}>
            <ClockIcon size={18} />
            <span>{isAr ? "السبت – الخميس: 10:00 ص – 10:00 م" : "Sat – Thu: 10:00 AM – 10:00 PM"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg-muted)", fontSize: "0.88rem" }}>
            <RulerIcon size={18} />
            <span>{isAr ? "مواعيد خاصة ومتابعة شخصية" : "Private 1-on-1 fitting appointments"}</span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <Link
              href="/contact?type=tailoring"
              style={{
                flex: 1,
                minWidth: 160,
                minHeight: 46,
                backgroundColor: "var(--btn-bg)",
                color: "var(--btn-fg)",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.88rem",
                padding: "0 16px",
              }}
            >
              {isAr ? "احجز موعدك الآن" : "Book Appointment"}
            </Link>
            <Link
              href="/fabrics"
              style={{
                flex: 1,
                minWidth: 140,
                minHeight: 46,
                backgroundColor: "transparent",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
                fontSize: "0.88rem",
                padding: "0 16px",
              }}
            >
              {isAr ? "تصفح الأقمشة" : "Browse Fabrics"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
