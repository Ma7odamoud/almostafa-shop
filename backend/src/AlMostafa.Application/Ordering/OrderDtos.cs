using AlMostafa.Domain.Ordering;

namespace AlMostafa.Application.Ordering;

/// <summary>
/// Checkout request. Only fabric ids and quantities are accepted from the client —
/// names, prices and totals are always taken from the catalogue on the server.
/// </summary>
public sealed record PlaceOrderRequest(
    IReadOnlyList<PlaceOrderItem>? Items,
    string? Name,
    string? Address,
    string? PaymentMethod);

public sealed record PlaceOrderItem(string FabricId, decimal Meters);

public sealed record OrderConfirmationDto(string OrderId, decimal Total, DateTimeOffset CreatedAt);

public sealed record OrderDto(
    string Id,
    string Name,
    string Address,
    string PaymentMethod,
    string Status,
    decimal Total,
    DateTimeOffset CreatedAt,
    IReadOnlyList<OrderItemDto> Items)
{
    public static OrderDto From(Order o) => new(
        o.Id,
        o.CustomerName,
        o.ShippingAddress,
        o.PaymentMethod,
        o.Status.ToString().ToLowerInvariant(),
        o.Total,
        o.CreatedAt,
        [.. o.Items.Select(i => new OrderItemDto(i.FabricId, i.FabricName.Ar, i.FabricName.En, i.Meters, i.PricePerMeter, i.LineTotal))]);
}

public sealed record OrderItemDto(
    string FabricId,
    string FabricNameAr,
    string FabricNameEn,
    decimal Meters,
    decimal PricePerMeter,
    decimal LineTotal);
