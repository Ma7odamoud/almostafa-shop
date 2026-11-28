import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import type { PagedResult } from "@/lib/api/types";
import type { Fabric } from "@/features/catalog/types";

export type Order = components["schemas"]["OrderDto"];
export type UpsertFabricRequest = components["schemas"]["UpsertFabricRequest"];

const base = "/api/v1/admin";

export const adminService = {
  listFabrics: (page = 1, pageSize = 100) =>
    apiRequest<PagedResult<Fabric>>(`${base}/fabrics`, { query: { page, pageSize } }),

  createFabric: (fabric: UpsertFabricRequest) =>
    apiRequest<Fabric>(`${base}/fabrics`, { method: "POST", body: fabric }),

  updateFabric: (id: string, fabric: UpsertFabricRequest) =>
    apiRequest<Fabric>(`${base}/fabrics/${encodeURIComponent(id)}`, { method: "PUT", body: fabric }),

  setVisibility: (id: string, hidden: boolean) =>
    apiRequest<Fabric>(`${base}/fabrics/${encodeURIComponent(id)}/visibility`, { method: "PATCH", body: { hidden } }),

  deleteFabric: (id: string) =>
    apiRequest<void>(`${base}/fabrics/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listOrders: (page = 1, pageSize = 50) =>
    apiRequest<PagedResult<Order>>(`${base}/orders`, { query: { page, pageSize } }),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<{ url: string }>(`${base}/uploads`, { method: "POST", body: form });
  },
};
