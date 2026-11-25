"use client";
import React from "react";
import { useLang } from "./Providers";
import { t } from "@/lib/i18n";

interface FilterState {
  colors: string[];
  patterns: string[];
  materials: string[];
  categories: string[];
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  options: {
    colors: { value: string; labelAr: string; labelEn: string }[];
    patterns: { value: string; labelAr: string; labelEn: string }[];
    materials: { value: string; labelAr: string; labelEn: string }[];
    categories: { value: string; labelAr: string; labelEn: string }[];
  };
  mobileOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ filters, onChange, options, mobileOpen, onClose }: Props) {
  const { locale } = useLang();

  function toggle(group: keyof FilterState, value: string) {
    const current = filters[group];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next });
  }

  function clearAll() {
    onChange({ colors: [], patterns: [], materials: [], categories: [] });
  }

  const hasAny =
    filters.colors.length + filters.patterns.length +
    filters.materials.length + filters.categories.length > 0;

  const sidebarStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "1.5rem",
    minWidth: 220,
    alignSelf: "flex-start",
  };

  // On mobile, overlay
  const mobileStyle: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 200,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: mobileOpen ? "flex" : "none",
    justifyContent: locale === "ar" ? "flex-end" : "flex-start",
  };

  return (
    <>
      {/* Mobile overlay */}
      <div style={mobileStyle} onClick={onClose}>
        <aside
          style={{
            ...sidebarStyle,
            borderRadius: 0,
            height: "100%",
            overflowY: "auto",
            width: 280,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <FilterContent
            locale={locale}
            filters={filters}
            options={options}
            toggle={toggle}
            clearAll={clearAll}
            hasAny={hasAny}
            onClose={onClose}
            showClose
          />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside style={{ ...sidebarStyle, display: "none" }} className="filter-sidebar-desktop">
        <FilterContent
          locale={locale}
          filters={filters}
          options={options}
          toggle={toggle}
          clearAll={clearAll}
          hasAny={hasAny}
        />
      </aside>

      <style>{`
        @media (min-width: 768px) {
          .filter-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}

function FilterContent({ locale, filters, options, toggle, clearAll, hasAny, onClose, showClose }: {
  locale: "ar" | "en";
  filters: { colors: string[]; patterns: string[]; materials: string[]; categories: string[] };
  options: Props["options"];
  toggle: (group: keyof { colors: string[]; patterns: string[]; materials: string[]; categories: string[] }, value: string) => void;
  clearAll: () => void;
  hasAny: boolean;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: "1rem", color: "var(--fg)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {t(locale, "filterTitle")}
        </h2>
        {showClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        )}
      </div>

      <FilterGroup
        label={t(locale, "filterCategory")}
        options={options.categories}
        selected={filters.categories}
        onToggle={(v) => toggle("categories", v)}
        locale={locale}
      />
      <FilterGroup
        label={t(locale, "filterColor")}
        options={options.colors}
        selected={filters.colors}
        onToggle={(v) => toggle("colors", v)}
        locale={locale}
      />
      <FilterGroup
        label={t(locale, "filterPattern")}
        options={options.patterns}
        selected={filters.patterns}
        onToggle={(v) => toggle("patterns", v)}
        locale={locale}
      />
      <FilterGroup
        label={t(locale, "filterMaterial")}
        options={options.materials}
        selected={filters.materials}
        onToggle={(v) => toggle("materials", v)}
        locale={locale}
      />

      {hasAny && (
        <button onClick={clearAll} style={{
          background: "none",
          border: "1px solid var(--border)",
          color: "var(--fg-muted)",
          borderRadius: "var(--radius-sm)",
          padding: "0.4rem 0.8rem",
          cursor: "pointer",
          fontSize: "0.8rem",
          transition: "border-color 0.3s, color 0.3s",
        }}>
          {t(locale, "filterClear")}
        </button>
      )}
    </div>
  );
}

function FilterGroup({ label, options, selected, onToggle, locale }: {
  label: string;
  options: { value: string; labelAr: string; labelEn: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  locale: "ar" | "en";
}) {
  return (
    <div>
      <h3 style={{ fontSize: "0.8rem", color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
        {label}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <span style={{
                width: 16, height: 16,
                border: `1px solid ${active ? "var(--btn-bg)" : "var(--border)"}`,
                borderRadius: 3,
                backgroundColor: active ? "var(--btn-bg)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s, border-color 0.2s",
              }}>
                {active && <span style={{ color: "var(--btn-fg)", fontSize: "0.65rem", lineHeight: 1 }}>✓</span>}
              </span>
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(opt.value)}
                style={{ display: "none" }}
              />
              <span style={{ color: "var(--fg-body)", fontSize: "0.85rem" }}>
                {locale === "ar" ? opt.labelAr : opt.labelEn}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
