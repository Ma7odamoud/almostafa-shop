namespace AlMostafa.Application.Catalog;

public enum FabricSort
{
    /// <summary>Catalogue order (creation order) — the original storefront ordering.</summary>
    Default = 0,
    Newest,
    Name,
    PriceAsc,
    PriceDesc,
}

/// <summary>Criteria for listing fabrics. Multiple values within one filter are OR-ed; different filters are AND-ed.</summary>
public sealed record FabricSearchCriteria
{
    public string? Search { get; init; }
    public IReadOnlyList<string> Colors { get; init; } = [];
    public IReadOnlyList<string> Patterns { get; init; } = [];
    public IReadOnlyList<string> Materials { get; init; } = [];
    public IReadOnlyList<string> Categories { get; init; } = [];
    public FabricSort Sort { get; init; } = FabricSort.Default;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = Common.Paging.DefaultPageSize;

    /// <summary>When false (storefront), hidden fabrics are excluded.</summary>
    public bool IncludeHidden { get; init; }
}
