using AlMostafa.Domain.Catalog;

namespace AlMostafa.Application.Catalog;

public interface IFabricRepository
{
    Task<Fabric?> FindAsync(string id, CancellationToken cancellationToken);

    Task<IReadOnlyList<Fabric>> FindManyAsync(IReadOnlyCollection<string> ids, CancellationToken cancellationToken);

    Task<(IReadOnlyList<Fabric> Items, int TotalCount)> SearchAsync(FabricSearchCriteria criteria, CancellationToken cancellationToken);

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
