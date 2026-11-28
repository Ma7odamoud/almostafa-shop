using AlMostafa.API.Common;
using AlMostafa.Application.Ordering;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace AlMostafa.API.Endpoints;

internal static class OrderEndpoints
{
    public static RouteGroupBuilder MapOrderEndpoints(this RouteGroupBuilder api)
    {
        api.MapPost("/orders", async Task<Results<Created<OrderConfirmationDto>, Ok<OrderConfirmationDto>>> (
                PlaceOrderRequest request, OrderService orders, CancellationToken ct,
                [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey) =>
            {
                var placement = await orders.PlaceAsync(request, NormalizeKey(idempotencyKey), ct);
                // 201 for a new order; 200 with the original confirmation when the same submission is repeated.
                return placement.Replayed
                    ? TypedResults.Ok(placement.Confirmation)
                    : TypedResults.Created((string?)null, placement.Confirmation);
            })
            .WithTags("Ordering")
            .WithName("PlaceOrder")
            .WithSummary("Place an order. Prices and totals are computed by the server. Send an Idempotency-Key header (e.g. a UUID per checkout) to make retries safe.")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .RequireRateLimiting(ApiConventions.OrdersRateLimit);

        api.MapGet("/orders/options", Ok<CheckoutOptionsDto> () => TypedResults.Ok(OrderService.GetCheckoutOptions()))
            .WithTags("Ordering")
            .WithName("GetCheckoutOptions")
            .WithSummary("Delivery governorates and payment methods offered at checkout.")
            .CacheOutput(CatalogOutputCache.Policy);

        return api;
    }

    /// <summary>Accepts printable ASCII keys up to 64 characters; anything else is rejected as a validation error.</summary>
    private static string? NormalizeKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key)) return null;
        key = key.Trim();
        if (key.Length > AlMostafa.Domain.Ordering.Order.MaxIdempotencyKeyLength || key.Any(c => c < 0x21 || c > 0x7E))
            throw new FluentValidation.ValidationException([new FluentValidation.Results.ValidationFailure("Idempotency-Key", "Idempotency-Key must be up to 64 printable characters.")]);
        return key;
    }
}
