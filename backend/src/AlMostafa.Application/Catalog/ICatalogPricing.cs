using AlMostafa.Domain.Common;

namespace AlMostafa.Application.Catalog;

/// <summary>
/// Contract the Ordering module uses to price an order. This is the only way Ordering
/// reads Catalog data, keeping the module boundary explicit.
/// </summary>
public interface ICatalogPricing
{
    /// <summary>Returns the current price snapshot of each requested fabric that exists and is visible to customers.</summary>
    Task<IReadOnlyDictionary<string, FabricPriceSnapshot>> GetOrderableFabricsAsync(
        IReadOnlyCollection<string> fabricIds, CancellationToken cancellationToken);
}

public sealed record FabricPriceSnapshot(string FabricId, LocalizedText Name, decimal PricePerMeter);
