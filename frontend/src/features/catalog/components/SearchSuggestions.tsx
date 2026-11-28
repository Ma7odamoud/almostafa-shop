"use client";
// Live suggestions under the header search. Uses the same cached search endpoint as the listing
// (6 card-sized results), debounced and cancelling stale requests, so typing never queues up work.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { catalogService } from "@/features/catalog/services/catalog";
import type { FabricSummary } from "@/features/catalog/types";
import { thumbnailSrc } from "@/lib/images";
import { formatPrice } from "@/lib/format";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 200;

export default function SearchSuggestions({ query, locale, onPick }: { query: string; locale: Locale; onPick: () => void }) {
  const [results, setResults] = useState<FabricSummary[]>([]);
  const q = query.trim();

  useEffect(() => {
    if (q.length < MIN_CHARS) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      catalogService
        .list({ search: q, pageSize: 6 }, controller.signal)
        .then((r) => setResults(r.items))
        .catch(() => {});
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  if (q.length < MIN_CHARS || results.length === 0) return null;

  const isAr = locale === "ar";
  return (
    <ul
      aria-label={isAr ? "اقتراحات البحث" : "Search suggestions"}
      style={{ listStyle: "none", margin: "8px auto 0", padding: 0, maxWidth: 680, display: "flex", flexDirection: "column" }}
    >
      {results.map((f) => {
        const photo = f.photos[0]?.src;
        return (
          <li key={f.id}>
            <Link
              href={`/fabrics/${f.id}`}
              onClick={onPick}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px", textDecoration: "none", borderBottom: "1px solid var(--border-subtle)" }}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailSrc(photo)} alt="" width={36} height={45} loading="lazy" decoding="async"
                  style={{ objectFit: "cover", borderRadius: 2, flexShrink: 0, background: "var(--bg-card)" }} />
              ) : (
                <span style={{ width: 36, height: 45, background: "var(--bg-card)", borderRadius: 2, flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, minWidth: 0, color: "var(--fg)", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isAr ? f.nameAr || f.nameEn : f.nameEn || f.nameAr}
              </span>
              {f.pricePerMeter > 0 && (
                <span style={{ color: "var(--fg-muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{formatPrice(f.pricePerMeter, locale)}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
