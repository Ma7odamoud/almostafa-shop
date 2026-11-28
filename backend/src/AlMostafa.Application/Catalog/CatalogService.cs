using AlMostafa.Application.Common;
using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Common;

namespace AlMostafa.Application.Catalog;

/// <summary>Storefront (read-only) catalogue use cases.</summary>
public sealed class CatalogService(IFabricRepository fabrics) : ICatalogPricing
{
    public async Task<PagedResult<FabricDto>> SearchAsync(FabricSearchCriteria criteria, CancellationToken cancellationToken)
    {
        var normalized = Normalize(criteria) with { IncludeHidden = false };
        var (items, total) = await fabrics.SearchAsync(normalized, cancellationToken);
        return new PagedResult<FabricDto>([.. items.Select(FabricDto.From)], normalized.Page, normalized.PageSize, total);
    }

    public async Task<FabricDto> GetAsync(string id, CancellationToken cancellationToken)
    {
        var fabric = await fabrics.FindAsync(id, cancellationToken);
        // Hidden fabrics are indistinguishable from missing ones for customers.
        if (fabric is null || fabric.Hidden)
            throw new NotFoundException("Fabric", id);
        return FabricDto.From(fabric);
    }

    public async Task<FabricFacetsDto> GetFacetsAsync(CancellationToken cancellationToken)
    {
        var sets = await fabrics.GetVisibleAttributesAsync(cancellationToken);
        return new FabricFacetsDto(
            ToOptions(sets.Colors),
            ToOptions(sets.Patterns),
            ToOptions(sets.Materials),
            ToOptions(FabricTaxonomy.Categories));
    }

    async Task<IReadOnlyDictionary<string, FabricPriceSnapshot>> ICatalogPricing.GetOrderableFabricsAsync(
        IReadOnlyCollection<string> fabricIds, CancellationToken cancellationToken)
    {
        var found = await fabrics.FindManyAsync(fabricIds, cancellationToken);
        return found
            .Where(f => !f.Hidden)
            .ToDictionary(f => f.Id, f => new FabricPriceSnapshot(f.Id, f.Name, f.PricePerMeter));
    }

    internal static FabricSearchCriteria Normalize(FabricSearchCriteria c) => c with
    {
        Search = string.IsNullOrWhiteSpace(c.Search) ? null : c.Search.Trim()[..Math.Min(c.Search.Trim().Length, 100)],
        Colors = NormalizeCodes(c.Colors),
        Patterns = NormalizeCodes(c.Patterns),
        Materials = NormalizeCodes(c.Materials),
        Categories = NormalizeCodes(c.Categories),
        Page = Math.Max(1, c.Page),
        PageSize = Math.Clamp(c.PageSize, 1, Paging.MaxPageSize),
    };

    private static string[] NormalizeCodes(IReadOnlyList<string> codes) =>
        [.. codes.Select(c => c.Trim().ToLowerInvariant()).Where(c => c.Length is > 0 and <= FabricAttribute.MaxCodeLength).Distinct().Take(50)];

    private static FacetOptionDto[] ToOptions(IEnumerable<FabricAttribute> attributes) =>
        [.. attributes.Select(a => new FacetOptionDto(a.Code, a.Label.Ar, a.Label.En))];
}
