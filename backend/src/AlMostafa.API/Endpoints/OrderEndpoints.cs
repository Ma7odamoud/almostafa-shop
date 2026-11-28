using AlMostafa.API.Common;
using AlMostafa.Application.Ordering;
using Microsoft.AspNetCore.Http.HttpResults;

namespace AlMostafa.API.Endpoints;

internal static class OrderEndpoints
{
    public static RouteGroupBuilder MapOrderEndpoints(this RouteGroupBuilder api)
    {
        api.MapPost("/orders", async Task<Created<OrderConfirmationDto>> (PlaceOrderRequest request, OrderService orders, CancellationToken ct) =>
                TypedResults.Created((string?)null, await orders.PlaceAsync(request, ct)))
            .WithTags("Ordering")
            .WithName("PlaceOrder")
            .WithSummary("Place an order. Prices and totals are computed by the server from the catalogue.")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .RequireRateLimiting(ApiConventions.OrdersRateLimit);

        return api;
    }
}
