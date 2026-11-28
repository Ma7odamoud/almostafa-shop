import type { components } from "@/lib/api/schema";

/** A fabric as returned by the API (generated from the backend's FabricDto). */
export type Fabric = components["schemas"]["FabricDto"];
/** Card-sized fabric returned by listings, search and "similar fabrics" (no descriptions or specs). */
export type FabricSummary = components["schemas"]["FabricSummaryDto"];
export type FabricPhoto = components["schemas"]["FabricPhotoDto"];
export type FabricFacets = components["schemas"]["FabricFacetsDto"];
export type FacetOption = components["schemas"]["FacetOptionDto"];

export type FabricSort = "default" | "newest" | "name" | "priceAsc" | "priceDesc";

export interface FabricListParams {
  search?: string;
  colors?: string[];
  patterns?: string[];
  materials?: string[];
  categories?: string[];
  sort?: FabricSort;
  page?: number;
  pageSize?: number;
}
