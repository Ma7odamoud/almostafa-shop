using AlMostafa.Domain.Catalog;

namespace AlMostafa.Application.Catalog;

public interface IFabricRepository
{
    Task<Fabric?> FindAsync(string id, CancellationToken cancellationToken);

    Task<IReadOnlyList<Fabric>> FindManyAsync(IReadOnlyCollection<string> ids, CancellationToken cancellationToken);

    /// <summary>Full fabrics (admin).</summary>
    Task<(IReadOnlyList<Fabric> Items, int TotalCount)> SearchAsync(FabricSearchCriteria criteria, CancellationToken cancellationToken);

    /// <summary>Card-sized projections, selected in SQL (storefront listings, search, suggestions).</summary>
    Task<(IReadOnlyList<FabricSummaryDto> Items, int TotalCount)> SearchSummariesAsync(FabricSearchCriteria criteria, CancellationToken cancellationToken);

    /// <summary>
    /// Visible fabrics most like <paramref name="fabric"/>: same garment category first, then same material,
    /// colour and pattern, newest first. One indexed query; never loads the catalogue.
    /// </summary>
    Task<IReadOnlyList<FabricSummaryDto>> FindSimilarAsync(Fabric fabric, int limit, CancellationToken cancellationToken);

    /// <summary>Distinct colour / pattern / material / category attributes among visible fabrics.</summary>
    Task<FabricAttributeSets> GetVisibleAttributesAsync(CancellationToken cancellationToken);

    Task<bool> ExistsAsync(string id, CancellationToken cancellationToken);

    void Add(Fabric fabric);

    void Remove(Fabric fabric);
}

public sealed record FabricAttributeSets(
    IReadOnlyList<FabricAttribute> Colors,
    IReadOnlyList<FabricAttribute> Patterns,
    IReadOnlyList<FabricAttribute> Materials);
