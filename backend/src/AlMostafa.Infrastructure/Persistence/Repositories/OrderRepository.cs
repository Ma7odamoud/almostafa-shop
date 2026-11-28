using AlMostafa.Application.Ordering;
using AlMostafa.Domain.Ordering;
using AlMostafa.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AlMostafa.Infrastructure.Persistence.Repositories;

internal sealed class OrderRepository(AppDbContext db) : IOrderRepository
{
    public void Add(Order order) => db.Orders.Add(order);

    public Task<Order?> FindByIdempotencyKeyAsync(string key, CancellationToken cancellationToken) =>
        db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.IdempotencyKey == key, cancellationToken);

    public bool IsDuplicateIdempotencyKey(Exception exception) =>
        exception is DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg }
        && pg.ConstraintName == OrderConfiguration.IdempotencyIndex;

    public async Task<(IReadOnlyList<Order> Items, int TotalCount)> ListAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        var total = await db.Orders.CountAsync(cancellationToken);
        var items = await db.Orders.AsNoTracking()
            .OrderByDescending(o => o.CreatedAt).ThenBy(o => o.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);
        return (items, total);
    }
}
