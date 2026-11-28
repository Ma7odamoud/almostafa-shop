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
    public async Task<OrderConfirmationDto> PlaceAsync(PlaceOrderRequest request, CancellationToken cancellationToken)
    {
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
        var order = Order.Place(NewId(now), request.Name!, request.Address!, request.PaymentMethod!, lines, now);
        orders.Add(order);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Order {OrderId} placed with {ItemCount} items, total {Total}", order.Id, order.Items.Count, order.Total);
        return new OrderConfirmationDto(order.Id, order.Total, order.CreatedAt);
    }

    public async Task<PagedResult<OrderDto>> ListAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, Paging.MaxPageSize);
        var (items, total) = await orders.ListAsync(page, pageSize, cancellationToken);
        return new PagedResult<OrderDto>([.. items.Select(OrderDto.From)], page, pageSize, total);
    }

    private static string NewId(DateTimeOffset now) =>
        $"order-{now:yyyyMMdd}-{Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(5))}";
}
