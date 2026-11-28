using System.Security.Cryptography;
using AlMostafa.Application.Catalog;
using AlMostafa.Application.Common;
using AlMostafa.Domain.Common;
using AlMostafa.Domain.Ordering;
using FluentValidation;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Application.Ordering;

public sealed class OrderService(
    IOrderRepository orders,
    ICatalogPricing pricing,
    IUnitOfWork unitOfWork,
    IValidator<PlaceOrderRequest> validator,
    TimeProvider clock,
    ILogger<OrderService> logger)
{
    /// <summary>
    /// Places an order in a single transaction (order + lines). With an <paramref name="idempotencyKey"/>, resubmitting the
    /// same checkout (double tap, network retry) returns the original order instead of creating a second one.
    /// </summary>
    public async Task<OrderPlacement> PlaceAsync(PlaceOrderRequest request, string? idempotencyKey, CancellationToken cancellationToken)
    {
        if (idempotencyKey is not null && await orders.FindByIdempotencyKeyAsync(idempotencyKey, cancellationToken) is { } previous)
            return new OrderPlacement(Confirmation(previous), Replayed: true);

        await validator.EnsureValidAsync(request, cancellationToken);
        var items = request.Items!;

        // Re-price every line from the catalogue: client-supplied prices are never trusted.
        var ids = items.Select(i => i.FabricId.Trim()).ToArray();
        var catalogue = await pricing.GetOrderableFabricsAsync(ids, cancellationToken);
        var unavailable = ids.Where(id => !catalogue.ContainsKey(id)).ToArray();
        if (unavailable.Length > 0)
            throw new DomainException("fabric_unavailable",
                $"These fabrics are no longer available: {string.Join(", ", unavailable)}. Please update your cart.");

        var lines = items.Select(i =>
        {
            var fabric = catalogue[i.FabricId.Trim()];
            return new OrderLine(fabric.FabricId, fabric.Name, i.Meters, fabric.PricePerMeter);
        });

        var now = clock.GetUtcNow();
        var customer = new OrderCustomer(request.Name, request.Phone, request.Email, request.Governorate, request.Area, request.Address);
        var order = Order.Place(NewId(now), customer, request.PaymentMethod!, lines, now, idempotencyKey);
        orders.Add(order);
        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex) when (idempotencyKey is not null && orders.IsDuplicateIdempotencyKey(ex))
        {
            // A concurrent request with the same key won the race: answer with that order.
            var winner = await orders.FindByIdempotencyKeyAsync(idempotencyKey, cancellationToken)
                ?? throw new InvalidOperationException("Order with idempotency key vanished.", ex);
            return new OrderPlacement(Confirmation(winner), Replayed: true);
        }

        logger.LogInformation("Order {OrderId} placed with {ItemCount} items, total {Total}", order.Id, order.Items.Count, order.Total);
        return new OrderPlacement(Confirmation(order), Replayed: false);
    }

    private static OrderConfirmationDto Confirmation(Order o) => new(o.Id, o.Total, o.CreatedAt);

    public async Task<PagedResult<OrderDto>> ListAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, Paging.MaxPageSize);
        var (items, total) = await orders.ListAsync(page, pageSize, cancellationToken);
        return new PagedResult<OrderDto>([.. items.Select(OrderDto.From)], page, pageSize, total);
    }

    public static CheckoutOptionsDto GetCheckoutOptions() => new(
        [.. DeliveryAreas.Governorates.Select(g => new CheckoutChoiceDto(g.Code, g.Label.Ar, g.Label.En))],
        [.. PaymentMethods.All.Select(p => new CheckoutChoiceDto(p.Code, p.Label.Ar, p.Label.En))]);

    private static string NewId(DateTimeOffset now) =>
        $"order-{now:yyyyMMdd}-{Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(5))}";
}
