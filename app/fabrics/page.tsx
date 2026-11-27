// Fabrics browse page — unified continuous grid + search + accordion filters
"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";
import { t } from "@/lib/i18n";
import FabricCard from "@/components/FabricCard";
import FilterSidebar from "@/components/FilterSidebar";
import { MagnifyingGlassIcon, SlidersIcon, XIcon } from "@/components/Icons";
import type { Fabric } from "@/lib/demoData";

const CATEGORIES = [
  { key: "suit",     labelAr: "بدل",     labelEn: "Suits" },
  { key: "jacket",   labelAr: "جاكيتات", labelEn: "Jackets" },
  { key: "trousers", labelAr: "بناطيل",  labelEn: "Trousers" },
  { key: "coat",     labelAr: "معاطف",   labelEn: "Coats" },
];

function FabricsContent() {
  const { locale } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";

  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    colors: [] as string[],
    patterns: [] as string[],
    materials: [] as string[],
    categories: [] as string[],
  });

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/fabrics")
      .then((r) => r.json())
      .then((d) => {
        setFabrics(d as Fabric[]);
        setLoading(false);
      })
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

  // Apply filters + search query
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fabrics.filter((f) => {
      if (filters.colors.length && !filters.colors.includes(f.color)) return false;
      if (filters.patterns.length && !filters.patterns.includes(f.pattern)) return false;
      if (filters.materials.length && !filters.materials.includes(f.material)) return false;
      if (filters.categories.length && !filters.categories.includes(f.category)) return false;
      if (q) {
        const searchable = [
          f.nameAr,
          f.nameEn,
          f.descriptionAr,
          f.descriptionEn,
          f.colorLabel.ar,
          f.colorLabel.en,
          f.materialLabel.ar,
          f.materialLabel.en,
          f.patternLabel.ar,
          f.patternLabel.en,
          f.categoryLabel.ar,
          f.categoryLabel.en,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [fabrics, filters, searchQuery]);

  const hasFilters =
    filters.colors.length +
      filters.patterns.length +
      filters.materials.length +
      filters.categories.length >
    0;

  function clearSearch() {
    setSearchQuery("");
    if (searchParams.get("q")) {
      router.replace("/fabrics");
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Page title + Search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h1
          style={{
            color: "var(--fg)",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 400,
            letterSpacing: "0.06em",
          }}
        >
          {t(locale, "allFabrics")}
        </h1>

        {/* Search input */}
        <div
          style={{
            position: "relative",
            width: "min(340px, 100%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              insetInlineStart: 12,
              color: "var(--fg-muted)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <MagnifyingGlassIcon size={18} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === "ar"
                ? "ابحث بالاسم، الخامة، أو اللون..."
                : "Search by fabric, material, or color..."
            }
            aria-label={locale === "ar" ? "بحث في الأقمشة" : "Search fabrics"}
            style={{
              width: "100%",
              paddingInlineStart: 38,
              paddingInlineEnd: searchQuery ? 36 : 12,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-card)",
              color: "var(--fg)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={locale === "ar" ? "مسح البحث" : "Clear search"}
              style={{
                position: "absolute",
                insetInlineEnd: 8,
                background: "none",
                border: "none",
                color: "var(--fg-muted)",
                cursor: "pointer",
                display: "flex",
                padding: 4,
              }}
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="divider-gold" style={{ marginTop: "0.5rem" }} />

      {/* Mobile filter button */}
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
        className="mobile-filter-btn"
      >
        <span style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>
          {filtered.length} {locale === "ar" ? "قماش" : "fabrics"}
        </span>
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
            gap: "0.45rem",
            minHeight: 40,
          }}
        >
          <SlidersIcon size={16} />
          <span>{t(locale, "filterTitle")}</span>
          {hasFilters && <span style={{ color: "var(--price)" }}>•</span>}
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
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: "1.75rem 1.25rem",
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

export default function FabricsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>...</div>}>
      <FabricsContent />
    </Suspense>
  );
}
