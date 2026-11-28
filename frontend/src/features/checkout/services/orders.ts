import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type PlaceOrderRequest = components["schemas"]["PlaceOrderRequest"];
export type OrderConfirmation = components["schemas"]["OrderConfirmationDto"];
export type CheckoutOptions = components["schemas"]["CheckoutOptionsDto"];

export const ordersService = {
  /** Only ids and quantities are sent — the backend prices the order from the catalogue. */
  /**
   * The idempotency key identifies one checkout attempt: resending it (double tap, retry after a network error)
   * returns the original order instead of creating a duplicate.
   */
  place: (request: PlaceOrderRequest, idempotencyKey: string) =>
    apiRequest<OrderConfirmation>("/api/v1/orders", { method: "POST", body: request, headers: { "Idempotency-Key": idempotencyKey } }),

  /** Delivery governorates and payment methods, owned by the backend. */
  options: (signal?: AbortSignal) => apiRequest<CheckoutOptions>("/api/v1/orders/options", { signal }),
};
