// Fabrics browse page — garment grouping + filter sidebar
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/Providers";
import { t } from "@/lib/i18n";
import FabricCard from "@/components/FabricCard";
import FilterSidebar from "@/components/FilterSidebar";
import type { Fabric } from "@/lib/demoData";

// ⚠️ OWNER NOTE: The fabric browse and single-fabric view are on the
// same /fabrics page (browsing) and /fabrics/[id] (single view).
// Please confirm whether you want browsing and single-view on separate
// pages or combined, and we will adjust accordingly.

const CATEGORIES = [
  { key: "suit",    labelAr: "بدل",      labelEn: "Suits" },
  { key: "jacket",  labelAr: "جاكيتات",  labelEn: "Jackets" },
  { key: "trousers",labelAr: "بناطيل",   labelEn: "Trousers" },
  { key: "coat",    labelAr: "معاطف",    labelEn: "Coats" },
];

export default function FabricsPage() {
  const { locale } = useLang();
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    colors: [] as string[],
    patterns: [] as string[],
    materials: [] as string[],
    categories: [] as string[],
  });

  useEffect(() => {
    fetch("/api/fabrics")
      .then((r) => r.json())
      .then((d) => { setFabrics(d as Fabric[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build filter options from actual fabric data
  const options = useMemo(() => {
    const unique = <T extends string>(arr: T[]) => [...new Set(arr)];
    const colorsRaw = unique(fabrics.map((f) => f.color));
    const patternsRaw = unique(fabrics.map((f) => f.pattern));
    const materialsRaw = unique(fabrics.map((f) => f.material));

    return {
      colors: colorsRaw.map((v) => {
        const f = fabrics.find((x) => x.color === v)!;
        return { value: v, labelAr: f.colorLabel.ar, labelEn: f.colorLabel.en };
      }),
      patterns: patternsRaw.map((v) => {
        const f = fabrics.find((x) => x.pattern === v)!;
        return { value: v, labelAr: f.patternLabel.ar, labelEn: f.patternLabel.en };
      }),
      materials: materialsRaw.map((v) => {
        const f = fabrics.find((x) => x.material === v)!;
        return { value: v, labelAr: f.materialLabel.ar, labelEn: f.materialLabel.en };
      }),
      categories: CATEGORIES.map((c) => ({ value: c.key, labelAr: c.labelAr, labelEn: c.labelEn })),
    };
  }, [fabrics]);

  // Apply filters
  const filtered = useMemo(() => fabrics.filter((f) => {
    if (filters.colors.length && !filters.colors.includes(f.color)) return false;
    if (filters.patterns.length && !filters.patterns.includes(f.pattern)) return false;
    if (filters.materials.length && !filters.materials.includes(f.material)) return false;
    if (filters.categories.length && !filters.categories.includes(f.category)) return false;
    return true;
  }), [fabrics, filters]);

  const hasFilters = filters.colors.length + filters.patterns.length + filters.materials.length + filters.categories.length > 0;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Page title */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--fg)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 400, letterSpacing: "0.06em" }}>
          {t(locale, "allFabrics")}
        </h1>
        <div className="divider-gold" />
      </div>

      {/* Mobile filter button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }} className="mobile-filter-btn">
        <button
          onClick={() => setMobileFilterOpen(true)}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            borderRadius: "var(--radius-sm)",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          ⚙ {t(locale, "filterTitle")}
          {hasFilters && <span style={{ color: "var(--gold-light)" }}>•</span>}
        </button>
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          options={options}
          mobileOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
        />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && (
            <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "3rem" }}>
              {t(locale, "loading")}
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "3rem" }}>
              {t(locale, "noResults")}
            </p>
          )}

          {/* Unified continuous product grid */}
          {!loading && filtered.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {filtered.map((f) => (
                <FabricCard key={f.id} fabric={f} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
