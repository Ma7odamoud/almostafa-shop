"use client";
import React from "react";
import { useLang } from "@/lib/preferences/preferences";

export default function PrivacyPage() {
  const { locale } = useLang();
  const isAr = locale === "ar";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <h1 style={{ color: "var(--fg)", fontSize: "2rem", fontWeight: 400, marginBottom: "0.5rem" }}>
        {isAr ? "سياسة الخصوصية والشروط" : "Privacy Policy & Terms"}
      </h1>
      <div className="divider-gold" />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", color: "var(--fg-body)", fontSize: "0.92rem", lineHeight: 1.8 }}>
        <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.08rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.5rem" }}>
            {isAr ? "البيانات التي نجمعها" : "Information We Collect"}
          </h2>
          <p style={{ color: "var(--fg-muted)" }}>
            {isAr
              ? "نجمع فقط البيانات اللازمة لإتمام طلبات الأقمشة أو حجوزات التفصيل (مثل الاسم، رقم الموبايل، عنوان التوصيل، والبريد الإلكتروني إن وُجد) ولا نشاركها مع أي طرف ثالث غير مرتبط بالتوصيل."
              : "We only collect the information necessary to fulfill your fabric orders or tailoring appointments (such as name, mobile number, delivery address, and email if provided) and never share it with unrelated third parties."}
          </p>
        </section>

        <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.08rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.5rem" }}>
            {isAr ? "التفضيلات المحفوظة" : "Saved Preferences"}
          </h2>
          <p style={{ color: "var(--fg-muted)" }}>
            {isAr
              ? "يتم حفظ اختيارك للغة (العربية / الإنجليزية) والمظهر (الداكن / الفاتح) ومحتويات سلة التسوق محلياً على متصفحك لتوفير تجربة سلسة في زياراتك القادمة."
              : "Your language preference, theme selection, and shopping cart items are stored locally in your browser to ensure a seamless experience across visits."}
          </p>
        </section>

        <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.08rem", fontWeight: 600, color: "var(--fg)", marginBottom: "0.5rem" }}>
            {isAr ? "التواصل والاستفسارات" : "Contact"}
          </h2>
          <p style={{ color: "var(--fg-muted)" }}>
            {isAr ? "لأي استفسار يتعلق بالخصوصية أو الطلبات، يرجى مراسلتنا على: " : "For any privacy or order inquiries, please contact us at: "}
            <a href="mailto:contactalmostafainfo@gmail.com" style={{ color: "var(--fg)", textDecoration: "underline" }}>
              contactalmostafainfo@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
