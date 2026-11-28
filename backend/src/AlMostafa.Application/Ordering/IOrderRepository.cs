using AlMostafa.Domain.Ordering;

namespace AlMostafa.Application.Ordering;

public interface IOrderRepository
{
    void Add(Order order);

    Task<Order?> FindByIdempotencyKeyAsync(string key, CancellationToken cancellationToken);

    /// <summary>True when the exception means another request already stored an order with the same idempotency key.</summary>
    bool IsDuplicateIdempotencyKey(Exception exception);

    /// <summary>Orders, newest first.</summary>
    Task<(IReadOnlyList<Order> Items, int TotalCount)> ListAsync(int page, int pageSize, CancellationToken cancellationToken);
}
