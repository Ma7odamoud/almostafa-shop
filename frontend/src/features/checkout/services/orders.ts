import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type PlaceOrderRequest = components["schemas"]["PlaceOrderRequest"];
export type OrderConfirmation = components["schemas"]["OrderConfirmationDto"];

export const ordersService = {
  /** Only ids and quantities are sent — the backend prices the order from the catalogue. */
  place: (request: PlaceOrderRequest) =>
    apiRequest<OrderConfirmation>("/api/v1/orders", { method: "POST", body: request }),
};
