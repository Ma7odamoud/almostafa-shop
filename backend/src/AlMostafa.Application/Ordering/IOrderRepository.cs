using AlMostafa.Domain.Ordering;

namespace AlMostafa.Application.Ordering;

public interface IOrderRepository
{
    void Add(Order order);

    /// <summary>Orders, newest first.</summary>
    Task<(IReadOnlyList<Order> Items, int TotalCount)> ListAsync(int page, int pageSize, CancellationToken cancellationToken);
}
