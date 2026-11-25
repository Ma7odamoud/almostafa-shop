// Admin fabric form — add/edit fabric
"use client";
import React, { useState, useRef } from "react";
import { useLang } from "@/components/Providers";
import { t } from "@/lib/i18n";
import type { Fabric } from "@/lib/demoData";

const EMPTY_FABRIC: Omit<Fabric, "id"> = {
  nameAr: "", nameEn: "",
  descriptionAr: "", descriptionEn: "",
  pricePerMeter: 0,
  stockMeters: 0,
  color: "", colorLabel: { ar: "", en: "" },
  material: "", materialLabel: { ar: "", en: "" },
  pattern: "plain", patternLabel: { ar: "سادة", en: "Plain" },
  category: "suit", categoryLabel: { ar: "بدلة", en: "Suit" },
  photos: [],
  hidden: false,
};

const PATTERNS = [
  { value: "plain", ar: "سادة", en: "Plain" },
  { value: "checks", ar: "مربعات", en: "Checks" },
  { value: "stripes", ar: "خطوط", en: "Stripes" },
  { value: "other", ar: "أنماط أخرى", en: "Other Patterns" },
];

const CATEGORIES = [
  { value: "suit", ar: "بدلة", en: "Suit" },
  { value: "jacket", ar: "جاكيت", en: "Jacket" },
  { value: "trousers", ar: "بنطلون", en: "Trousers" },
  { value: "coat", ar: "معطف", en: "Coat" },
];

interface Props {
  fabric: Fabric | null;
  onCancel: () => void;
  onSaved: () => void;
}

export default function FabricForm({ fabric, onCancel, onSaved }: Props) {
  const { locale } = useLang();
  const isNew = !fabric;

  const [form, setForm] = useState<Omit<Fabric, "id"> & { id?: string }>(
    fabric ?? { ...EMPTY_FABRIC }
  );
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadPhoto() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploadingIdx(-1);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await r.json();
    if (data.url) {
      set("photos", [...form.photos, { src: data.url, alt: file.name }]);
    }
    setUploadingIdx(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(i: number) {
    set("photos", form.photos.filter((_, idx) => idx !== i));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.nameEn.trim() && !form.nameAr.trim()) {
      setError("Please provide at least a name in English or Arabic.");
      return;
    }
    setSaving(true);
    const payload: Fabric = {
      ...form,
      id: form.id ?? `fab-${Date.now()}`,
    };
    const r = await fetch("/api/admin/fabrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (r.ok) onSaved();
    else setError("Save failed — see console.");
  }

  const patternObj = PATTERNS.find((p) => p.value === form.pattern) ?? PATTERNS[0];
  const categoryObj = CATEGORIES.find((c) => c.value === form.category) ?? CATEGORIES[0];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="admin-badge" style={{ marginBottom: "1rem" }}>🔒 Admin — Not public</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ color: "var(--fg)", fontSize: "1.4rem", fontWeight: 400 }}>
          {isNew
            ? t(locale, "adminAddProduct")
            : `${t(locale, "adminEdit")}: ${form.nameEn || form.nameAr}`}
        </h1>
        <button onClick={onCancel} style={outlineBtn}>{t(locale, "adminCancel")}</button>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Names */}
        <Section label="Names">
          <Row>
            <Field label="Name (English)" value={form.nameEn} onChange={(v) => set("nameEn", v)} />
            <Field label="الاسم بالعربية" value={form.nameAr} onChange={(v) => set("nameAr", v)} dir="rtl" />
          </Row>
        </Section>

        {/* Descriptions */}
        <Section label="Descriptions">
          <Field label="Description (English)" value={form.descriptionEn} onChange={(v) => set("descriptionEn", v)} multiline />
          <Field label="الوصف بالعربية" value={form.descriptionAr} onChange={(v) => set("descriptionAr", v)} multiline dir="rtl" />
        </Section>

        {/* Price & Stock */}
        <Section label="Price & Stock">
          <Row>
            <div>
              <label style={labelStyle}>Price per metre (⚠️ set real price)</label>
              <input type="number" min={0} step={0.01} value={form.pricePerMeter}
                onChange={(e) => set("pricePerMeter", +e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stock in metres (⚠️ set real stock)</label>
              <input type="number" min={0} step={0.5} value={form.stockMeters}
                onChange={(e) => set("stockMeters", +e.target.value)} style={inputStyle} />
            </div>
          </Row>
        </Section>

        {/* Category & Pattern */}
        <Section label="Category & Pattern">
          <Row>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => {
                const c = CATEGORIES.find((x) => x.value === e.target.value)!;
                set("category", c.value);
                set("categoryLabel", { ar: c.ar, en: c.en });
              }} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.en}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Pattern</label>
              <select value={form.pattern} onChange={(e) => {
                const p = PATTERNS.find((x) => x.value === e.target.value)!;
                set("pattern", p.value);
                set("patternLabel", { ar: p.ar, en: p.en });
              }} style={inputStyle}>
                {PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.en}</option>)}
              </select>
            </div>
          </Row>
        </Section>

        {/* Color & Material */}
        <Section label="Colour & Material">
          <Row>
            <div>
              <Field label="Colour (e.g. navy)" value={form.color} onChange={(v) => set("color", v)} />
              <Row>
                <Field label="Label EN" value={form.colorLabel.en} onChange={(v) => set("colorLabel", { ...form.colorLabel, en: v })} />
                <Field label="التسمية AR" value={form.colorLabel.ar} onChange={(v) => set("colorLabel", { ...form.colorLabel, ar: v })} dir="rtl" />
              </Row>
            </div>
            <div>
              <Field label="Material (e.g. wool)" value={form.material} onChange={(v) => set("material", v)} />
              <Row>
                <Field label="Label EN" value={form.materialLabel.en} onChange={(v) => set("materialLabel", { ...form.materialLabel, en: v })} />
                <Field label="التسمية AR" value={form.materialLabel.ar} onChange={(v) => set("materialLabel", { ...form.materialLabel, ar: v })} dir="rtl" />
              </Row>
            </div>
          </Row>
        </Section>

        {/* Photos */}
        <Section label="Photos (first = draped/card, second = mannequin/hover)">
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {form.photos.map((ph, i) => (
              <div key={i} style={{ position: "relative", width: 90, height: 112 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.src} alt={ph.alt} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: "absolute", top: -6, right: -6,
                    background: "#e55", border: "none", color: "#fff",
                    borderRadius: "50%", width: 20, height: 20,
                    cursor: "pointer", fontSize: "0.7rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
                <p style={{ fontSize: "0.65rem", color: "var(--fg-muted)", textAlign: "center" }}>
                  {i === 0 ? "Draped" : i === 1 ? "Mannequin" : `Photo ${i+1}`}
                </p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ color: "var(--fg-muted)", fontSize: "0.82rem" }} />
            <button type="button" onClick={uploadPhoto} disabled={uploadingIdx !== null} style={goldBtnSmall}>
              {uploadingIdx !== null ? "Uploading…" : "Upload Photo"}
            </button>
          </div>
        </Section>

        {/* Visibility */}
        <Section label="Visibility">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={form.hidden} onChange={(e) => set("hidden", e.target.checked)}
              style={{ accentColor: "var(--gold-light)" }} />
            <span style={{ color: "var(--fg-body)", fontSize: "0.9rem" }}>
              Hidden from customers (e.g. sold out or draft)
            </span>
          </label>
        </Section>

        {error && <p style={{ color: "#e55" }}>{error}</p>}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={outlineBtn}>{t(locale, "adminCancel")}</button>
          <button type="submit" disabled={saving} style={goldBtn}>
            {saving ? t(locale, "loading") : t(locale, "adminSave")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "1.25rem",
    }}>
      <h3 style={{ color: "var(--fg-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>{label}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>{children}</div>;
}

function Field({ label, value, onChange, multiline, dir }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; dir?: string;
}) {
  const style: React.CSSProperties = { ...inputStyle, direction: dir as "rtl" | "ltr" | undefined };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{ ...style, minHeight: 72, resize: "vertical" }} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={style} />}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--fg-muted)",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "0.25rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--fg-body)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 0.7rem",
  fontSize: "0.88rem",
};

const goldBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--gold-mid), var(--gold-light))",
  color: "var(--navy-deep)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "0.7rem 1.5rem",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "0.9rem",
};

const goldBtnSmall: React.CSSProperties = { ...goldBtn, padding: "0.4rem 0.9rem", fontSize: "0.8rem" };

const outlineBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  color: "var(--fg-muted)",
  borderRadius: "var(--radius-sm)",
  padding: "0.6rem 1.2rem",
  cursor: "pointer",
  fontSize: "0.88rem",
};
