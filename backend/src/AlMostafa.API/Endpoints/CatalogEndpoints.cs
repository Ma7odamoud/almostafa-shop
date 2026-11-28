using AlMostafa.API.Common;
using AlMostafa.Application.Catalog;
using AlMostafa.Application.Common;
using Microsoft.AspNetCore.Http.HttpResults;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;

namespace AlMostafa.API.Endpoints;

/// <summary>Query-string parameters shared by the public and admin fabric listings.</summary>
internal sealed class FabricListQuery
{
    [FromQuery(Name = "search")] public string? Search { get; init; }
    [FromQuery(Name = "colors")] public string[]? Colors { get; init; }
    [FromQuery(Name = "patterns")] public string[]? Patterns { get; init; }
    [FromQuery(Name = "materials")] public string[]? Materials { get; init; }
    [FromQuery(Name = "categories")] public string[]? Categories { get; init; }

    /// <summary>One of: default, newest, name, priceAsc, priceDesc (case-insensitive).</summary>
    [FromQuery(Name = "sort")] public string? Sort { get; init; }
    [FromQuery(Name = "page")] public int? Page { get; init; }
    [FromQuery(Name = "pageSize")] public int? PageSize { get; init; }

    public FabricSearchCriteria ToCriteria() => new()
    {
        Search = Search,
        Colors = Colors ?? [],
        Patterns = Patterns ?? [],
        Materials = Materials ?? [],
        Categories = Categories ?? [],
        Sort = ParseSort(Sort),
        Page = Page ?? 1,
        PageSize = PageSize ?? Paging.DefaultPageSize,
    };

    private static FabricSort ParseSort(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return FabricSort.Default;
        if (Enum.TryParse<FabricSort>(value, ignoreCase: true, out var sort) && Enum.IsDefined(sort) && !int.TryParse(value, out _))
            return sort;
        throw new ValidationException([new ValidationFailure("sort",
            $"Sort must be one of: {string.Join(", ", Enum.GetNames<FabricSort>().Select(n => char.ToLowerInvariant(n[0]) + n[1..]))}.")]);
    }
}

internal static class CatalogEndpoints
{
    public static RouteGroupBuilder MapCatalogEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/fabrics").WithTags("Catalog").CacheOutput(CatalogOutputCache.Policy);

        group.MapGet("/", async Task<Ok<PagedResult<FabricSummaryDto>>> ([AsParameters] FabricListQuery query, CatalogService catalog, CancellationToken ct) =>
                TypedResults.Ok(await catalog.SearchAsync(query.ToCriteria(), ct)))
            .WithName("ListFabrics")
            .WithSummary("List visible fabrics (card-sized summaries) with filtering, search, sorting and pagination. Also used for search suggestions (pageSize=6).");

        group.MapGet("/{id}/similar", async Task<Ok<IReadOnlyList<FabricSummaryDto>>> (string id, CatalogService catalog, CancellationToken ct, [FromQuery(Name = "limit")] int? limit) =>
                TypedResults.Ok(await catalog.GetSimilarAsync(id, limit ?? 4, ct)))
            .WithName("GetSimilarFabrics")
            .WithSummary("Visible fabrics most like this one (same garment category, then material, colour, pattern).")
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapGet("/facets", async Task<Ok<FabricFacetsDto>> (CatalogService catalog, CancellationToken ct) =>
                TypedResults.Ok(await catalog.GetFacetsAsync(ct)))
            .WithName("GetFabricFacets")
            .WithSummary("Distinct filter values (colour, pattern, material, category) among visible fabrics.");

        group.MapGet("/{id}", async Task<Ok<FabricDto>> (string id, CatalogService catalog, CancellationToken ct) =>
                TypedResults.Ok(await catalog.GetAsync(id, ct)))
            .WithName("GetFabric")
            .WithSummary("Get a visible fabric by id.")
            .ProducesProblem(StatusCodes.Status404NotFound);

        return api;
    }
}
