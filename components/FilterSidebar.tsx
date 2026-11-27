"use client";
import React, { useState } from "react";
import { useLang } from "./Providers";
import { t } from "@/lib/i18n";
import { CaretDownIcon, CheckIcon, XIcon } from "./Icons";

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

const COLOR_SWATCHES: Record<string, string> = {
  navy: "#1C2A44",
  grey: "#7A7E82",
  gray: "#7A7E82",
  beige: "#D2C5AE",
  charcoal: "#36383A",
  black: "#1A1A1A",
  brown: "#5C4033",
  blue: "#2E4C7D",
  olive: "#4A492E",
  white: "#F7F6F4",
  cream: "#EFE8D8",
  burgundy: "#5C1E26",
};

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
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    padding: "1.25rem",
    minWidth: 230,
    alignSelf: "flex-start",
  };

  const mobileStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 2100,
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(3px)",
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
            width: "min(300px, 85vw)",
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
  filters: FilterState;
  options: Props["options"];
  toggle: (group: keyof FilterState, value: string) => void;
  clearAll: () => void;
  hasAny: boolean;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <h2
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--fg)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {t(locale, "filterTitle")}
        </h2>
        {showClose && (
          <button
            onClick={onClose}
            aria-label={t(locale, "close")}
            style={{
              background: "none",
              border: "none",
              color: "var(--fg)",
              cursor: "pointer",
              minWidth: 36,
              minHeight: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XIcon size={18} />
          </button>
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
        isColorGroup
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
        <button
          onClick={clearAll}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            borderRadius: "var(--radius-sm)",
            padding: "0.5rem 0.8rem",
            cursor: "pointer",
            fontSize: "0.8rem",
            marginTop: "0.25rem",
            transition: "opacity 0.2s",
          }}
        >
          {t(locale, "filterClear")}
        </button>
      )}
    </div>
  );
}

function FilterGroup({ label, options, selected, onToggle, locale, isColorGroup }: {
  label: string;
  options: { value: string; labelAr: string; labelEn: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  locale: "ar" | "en";
  isColorGroup?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.85rem" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "0.2rem 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: "var(--fg)",
          fontSize: "0.78rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>
          {label}
          {selected.length > 0 && (
            <span style={{ color: "var(--price)", marginInlineStart: 6 }}>({selected.length})</span>
          )}
        </span>
        <span
          style={{
            display: "flex",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            color: "var(--fg-muted)",
          }}
        >
          <CaretDownIcon size={14} />
        </span>
      </button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "0.65rem",
          }}
        >
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            const swatchColor = isColorGroup ? COLOR_SWATCHES[opt.value.toLowerCase()] : undefined;

            return (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  cursor: "pointer",
                  padding: "2px 0",
                }}
              >
                {swatchColor ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: swatchColor,
                      border: active ? "2px solid var(--fg)" : "1px solid var(--border)",
                      boxShadow: active ? "0 0 0 2px var(--bg-card)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "transform 0.15s ease",
                      transform: active ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: `1px solid ${active ? "var(--btn-bg)" : "var(--border)"}`,
                      borderRadius: 3,
                      backgroundColor: active ? "var(--btn-bg)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.2s, border-color 0.2s",
                      color: "var(--btn-fg)",
                    }}
                  >
                    {active && <CheckIcon size={11} />}
                  </span>
                )}
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggle(opt.value)}
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    color: active ? "var(--fg)" : "var(--fg-body)",
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.85rem",
                  }}
                >
                  {locale === "ar" ? opt.labelAr : opt.labelEn}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
