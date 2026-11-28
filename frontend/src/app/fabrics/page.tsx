// Fabrics listing (server). The first page of results and the filter options are fetched in parallel on the
// server, so the grid and its first photos are in the initial HTML.
import FabricsBrowser from "@/features/catalog/components/FabricsBrowser";
import { catalogService } from "@/features/catalog/services/catalog";
import type { FabricFacets, FabricSummary } from "@/features/catalog/types";
import type { PagedResult } from "@/lib/api/types";

const PAGE_SIZE = 24; // same as FabricsBrowser
const EMPTY: PagedResult<FabricSummary> = { items: [], page: 1, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 0 };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams;
  const [result, facets] = await Promise.all([
    catalogService.list({ search: q, categories: category ? [category] : undefined, page: 1, pageSize: PAGE_SIZE }).catch(() => EMPTY),
    catalogService.facets().catch((): FabricFacets | null => null),
  ]);

  // No <Suspense> here on purpose: this route renders per request (it reads cookies), so useSearchParams does not
  // need a boundary — and a boundary would stream the grid after the footer, making the footer jump (layout shift).
  return <FabricsBrowser initialResult={result} initialFacets={facets} />;
}
