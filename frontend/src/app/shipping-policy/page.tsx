"use client";
import React from "react";
import { useLang } from "@/lib/preferences/preferences";

export default function ShippingPolicyPage() {
  const { locale } = useLang();
  const isAr = locale === "ar";

  const sections = [
    {
      titleAr: "سياسة التوصيل والشحن",
      titleEn: "Shipping & Delivery",
      bodyAr:
        "يتم تجهيز وتغليف طلبات الأقمشة بعناية لحماية الخامة أثناء النقل. يتوفر التوصيل داخل القاهرة الكبرى وجميع محافظات مصر، كما يمكن استلام الطلب مباشرة من معرضنا في وسط البلد.",
      bodyEn:
        "All fabric orders are inspected, folded, and securely packaged to protect the cloth in transit. Delivery is available across Greater Cairo and all Egyptian governorates, or via complimentary pickup at our Downtown Cairo showroom.",
    },
    {
      titleAr: "سياسة قص الأقمشة والاسترجاع",
      titleEn: "Custom-Cut Fabrics & Returns",
      bodyAr:
        "نظراً لأن الأقمشة تُقص خصيصاً حسب الطول المطلوب بالمتر لكل عميل، لا يمكن استرجاع أو استبدال الأقمشة المقصوصة إلا في حالة وجود عيب مصنعي واضح أو خطأ في الكمية أو الصنف المرسل.",
      bodyEn:
        "Because every fabric length is custom-cut to your exact meterage order, cut fabrics cannot be returned or exchanged unless there is a clear manufacturing defect or an error in the item or meterage dispatched.",
    },
    {
      titleAr: "تعديلات التفصيل (Bespoke)",
      titleEn: "Bespoke Tailoring Adjustments",
      bodyAr:
        "تشمل جميع طلبات التفصيل بروفة وضبطاً مجانياً قبل الاستلام النهائي لضمان مطابقة القياس والراحة التامة.",
      bodyEn:
        "All bespoke tailoring commissions include a dedicated fitting and complimentary adjustments prior to final handover to ensure an exact fit.",
    },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, marginBottom: "0.5rem" }}>
        {isAr ? "سياسة الشحن والقص والاسترجاع" : "Shipping, Cutting & Return Policy"}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {sections.map((s) => (
          <section
            key={s.titleEn}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.65rem" }}>
              {isAr ? s.titleAr : s.titleEn}
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.92rem", lineHeight: 1.8 }}>
              {isAr ? s.bodyAr : s.bodyEn}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
