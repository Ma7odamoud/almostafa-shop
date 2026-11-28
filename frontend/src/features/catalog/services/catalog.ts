import { apiRequest } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Fabric, FabricFacets, FabricListParams } from "../types";

export const catalogService = {
  list: (params: FabricListParams = {}, signal?: AbortSignal) =>
    apiRequest<PagedResult<Fabric>>("/api/v1/fabrics", { query: { ...params }, signal }),

  get: (id: string, signal?: AbortSignal) =>
    apiRequest<Fabric>(`/api/v1/fabrics/${encodeURIComponent(id)}`, { signal }),

  facets: (signal?: AbortSignal) => apiRequest<FabricFacets>("/api/v1/fabrics/facets", { signal }),
};
