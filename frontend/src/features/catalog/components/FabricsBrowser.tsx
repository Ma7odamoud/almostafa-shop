// Fabrics browse page — unified continuous grid + search + accordion filters
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/preferences/preferences";
import { t } from "@/lib/i18n";
import FabricCard from "@/features/catalog/components/FabricCard";
import FilterSidebar from "@/features/catalog/components/FilterSidebar";
import { MagnifyingGlassIcon, SlidersIcon, XIcon } from "@/components/ui/Icons";
import type { FabricFacets, FabricSummary } from "@/features/catalog/types";
import type { PagedResult } from "@/lib/api/types";
import { catalogService } from "@/features/catalog/services/catalog";
import { errorMessage } from "@/lib/api/errors";

const CATEGORIES = [
  { key: "suit",     labelAr: "بدل",     labelEn: "Suits" },
  { key: "jacket",   labelAr: "جاكيتات", labelEn: "Jackets" },
  { key: "trousers", labelAr: "بناطيل",  labelEn: "Trousers" },
  { key: "coat",     labelAr: "معاطف",   labelEn: "Coats" },
];

const PAGE_SIZE = 24;

/** Grid slots: one column on narrow phones, ~3 on tablets, ~260 px cards on desktop. */
const GRID_SIZES = "(max-width: 520px) 92vw, (max-width: 1100px) 33vw, 260px";

interface Props {
  initialResult: PagedResult<FabricSummary>;
  initialFacets: FabricFacets | null;
}

/**
 * Fabric browser. The first page of results and the filter options are rendered on the server (see
 * app/fabrics/page.tsx); the browser only calls the API when the visitor changes the search or a filter.
 */
export default function FabricsBrowser({ initialResult, initialFacets }: Props) {
  const { locale } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const [fabrics, setFabrics] = useState<FabricSummary[]>(initialResult.items);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [totalCount, setTotalCount] = useState(initialResult.totalCount);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    colors: [] as string[],
    patterns: [] as string[],
    materials: [] as string[],
    categories: initialCategory ? [initialCategory] : ([] as string[]),
  });

  useEffect(() => {
    // Re-sync when the URL changes (e.g. a search from the header) — only if it differs from the current state.
    const q = searchParams.get("q") ?? "";
    const cat = searchParams.get("category");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery((prev) => (prev === q ? prev : q));
    if (cat) {
      setFilters((prev) => (prev.categories.length === 1 && prev.categories[0] === cat ? prev : { ...prev, categories: [cat] }));
    }
  }, [searchParams]);

  // Debounce typing so the API is queried once the visitor pauses.
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Filter options: colours / patterns / materials present in the catalogue (server-computed).
  const facets = initialFacets;

  // Filtering, search and pagination run on the backend; previous results stay visible while refreshing.
  // The first render already has the server's results, so the initial run is skipped.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const controller = new AbortController();
    catalogService
      .list({ search: debouncedQuery, ...filters, page: 1, pageSize: PAGE_SIZE }, controller.signal)
      .then((result) => {
        setFabrics(result.items);
        setTotalCount(result.totalCount);
        setPage(1);
        setLoadError("");
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(errorMessage(err, locale));
        setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, filters, locale]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const result = await catalogService.list({ search: debouncedQuery, ...filters, page: page + 1, pageSize: PAGE_SIZE });
      setFabrics((prev) => [...prev, ...result.items]);
      setTotalCount(result.totalCount);
      setPage(result.page);
    } catch (err) {
      setLoadError(errorMessage(err, locale));
    } finally {
      setLoadingMore(false);
    }
  }

  const options = useMemo(() => ({
    colors: facets?.colors ?? [],
    patterns: facets?.patterns ?? [],
    materials: facets?.materials ?? [],
    categories: CATEGORIES.map((c) => ({ value: c.key, labelAr: c.labelAr, labelEn: c.labelEn })),
  }), [facets]);

  const filtered = fabrics;

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
          {totalCount} {locale === "ar" ? "قماش" : "fabrics"}
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

          {!loading && loadError && (
            <p role="alert" style={{ color: "#e55", textAlign: "center", padding: "1rem" }}>
              {loadError}
            </p>
          )}
          {!loading && !loadError && filtered.length === 0 && (
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
              {filtered.map((f, index) => (
                <FabricCard key={f.id} fabric={f} priority={index < 2} sizes={GRID_SIZES} />
              ))}
            </div>
          )}
          {!loading && fabrics.length < totalCount && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.6rem 1.5rem",
                  cursor: loadingMore ? "wait" : "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {loadingMore ? t(locale, "loading") : locale === "ar" ? "عرض المزيد" : "Load more"}
              </button>
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
