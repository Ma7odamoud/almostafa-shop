"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/Providers";
import { CaretDownIcon } from "@/components/Icons";

const FAQS = [
  {
    qAr: "هل يمكنني شراء القماش فقط بدون تفصيل؟",
    qEn: "Can I purchase fabric without booking tailoring?",
    aAr: "نعم بالتأكيد. يمكنك طلب أي قماش بالمتر مباشرة من صفحة القماش وإرساله لخياطك الخاص، أو الحضور لمعرضنا لتفصيله.",
    aEn: "Yes. You can order any fabric by the meter directly from the product page for your personal tailor, or choose our bespoke tailoring service.",
  },
  {
    qAr: "كم متراً أحتاج لتفصيل بدلة كاملة؟",
    qEn: "How many metres do I need for a full two-piece suit?",
    aAr: "في المتوسط تحتاج البدلة الكلاسيكية (جاكيت + بنطلون) من 3 إلى 3.5 متر بعرض 150 سم، وتختلف الكمية قليلاً حسب الطول والمقاس ونوع النقشة.",
    aEn: "A standard two-piece suit (jacket and trousers) typically requires 3.0 to 3.5 metres at 150 cm width, depending on height, size, and pattern matching.",
  },
  {
    qAr: "كيف أحجز موعداً لأخذ المقاسات والتفصيل؟",
    qEn: "How do I book a bespoke fitting appointment?",
    aAr: "يمكنك حجز موعد مباشرة عبر صفحة التفصيل أو صفحة التواصل باختيار تبويب \"حجز موعد / طلب تفصيل\"، أو مراسلتنا على contactalmostafainfo@gmail.com.",
    aEn: "You can book via the Tailoring Appointment tab on our Contact page, or email us directly at contactalmostafainfo@gmail.com.",
  },
  {
    qAr: "ما هو الحد الأدنى للطلب بالمتر؟",
    qEn: "What is the minimum cut length?",
    aAr: "الحد الأدنى للقص هو 0.5 متر، مع إمكانية الزيادة بمقدار نصف متر (0.5 م) لتناسب طلبك بدقة.",
    aEn: "The minimum cut length is 0.5 metres, with increments of 0.5 metres so you can order the exact length you need.",
  },
  {
    qAr: "هل تتوفر خدمة الشحن خارج القاهرة؟",
    qEn: "Do you deliver outside Cairo?",
    aAr: "نعم، نوفر الشحن إلى القاهرة والجيزة وجميع محافظات مصر بتغليف يحافظ على القماش.",
    aEn: "Yes, we deliver across Cairo, Giza, and all Egyptian governorates with protective garment packaging.",
  },
];

export default function FaqPage() {
  const { locale } = useLang();
  const isAr = locale === "ar";
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, marginBottom: "0.5rem" }}>
        {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
        {FAQS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "1.1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  cursor: "pointer",
                  textAlign: isAr ? "right" : "left",
                  color: "var(--fg)",
                  fontSize: "0.96rem",
                  fontWeight: 500,
                }}
              >
                <span>{isAr ? item.qAr : item.qEn}</span>
                <span
                  style={{
                    display: "flex",
                    color: "var(--fg-muted)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <CaretDownIcon size={16} />
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: "0 1.25rem 1.15rem",
                    color: "var(--fg-muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.75,
                  }}
                >
                  {isAr ? item.aAr : item.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          {isAr ? "هل لديك سؤال آخر؟ يسعدنا تواصلك معنا." : "Have another question? We would be glad to help."}
        </p>
        <Link
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            padding: "0 24px",
            backgroundColor: "var(--btn-bg)",
            color: "var(--btn-fg)",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            fontSize: "0.88rem",
          }}
        >
          {isAr ? "تواصل معنا" : "Contact Us"}
        </Link>
      </div>
    </div>
  );
}
