using AlMostafa.Application.Common;
using AlMostafa.Domain.Catalog;

namespace AlMostafa.Application.Catalog;

/// <summary>
/// Fabric as exposed over the API. The shape intentionally matches the original frontend
/// <c>Fabric</c> type so existing components keep working unchanged.
/// </summary>
public sealed record FabricDto(
    string Id,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    decimal PricePerMeter,
    decimal StockMeters,
    string Color,
    LocalizedTextDto ColorLabel,
    string Material,
    LocalizedTextDto MaterialLabel,
    string Pattern,
    LocalizedTextDto PatternLabel,
    string Category,
    LocalizedTextDto CategoryLabel,
    IReadOnlyList<FabricPhotoDto> Photos,
    bool Hidden,
    DateTimeOffset UpdatedAt,
    string CompositionAr,
    string CompositionEn,
    decimal? WidthCm,
    int? WeightGsm,
    string? Season,
    LocalizedTextDto? SeasonLabel,
    string CareAr,
    string CareEn)
{
    public static FabricDto From(Fabric f) => new(
        f.Id,
        f.Name.Ar,
        f.Name.En,
        f.Description.Ar,
        f.Description.En,
        f.PricePerMeter,
        f.StockMeters,
        f.Color.Code,
        LocalizedTextDto.From(f.Color.Label),
        f.Material.Code,
        LocalizedTextDto.From(f.Material.Label),
        f.Pattern.Code,
        LocalizedTextDto.From(f.Pattern.Label),
        f.Category.Code,
        LocalizedTextDto.From(f.Category.Label),
        [.. f.Photos.Select(p => new FabricPhotoDto(p.Src, p.Alt))],
        f.Hidden,
        f.UpdatedAt,
        f.Specifications.Composition.Ar,
        f.Specifications.Composition.En,
        f.Specifications.WidthCm,
        f.Specifications.WeightGsm,
        f.Specifications.Season,
        f.Specifications.Season is { } season ? LocalizedTextDto.From(FabricTaxonomy.Season(season).Label) : null,
        f.Specifications.Care.Ar,
        f.Specifications.Care.En);
}

public sealed record FabricPhotoDto(string Src, string Alt);

/// <summary>
/// What a fabric card needs — and nothing more (no descriptions or specifications), keeping listing
/// responses small. Returned by listings, search, suggestions and "similar fabrics".
/// </summary>
public sealed record FabricSummaryDto(
    string Id,
    string NameAr,
    string NameEn,
    decimal PricePerMeter,
    decimal StockMeters,
    string Color,
    LocalizedTextDto ColorLabel,
    string Material,
    LocalizedTextDto MaterialLabel,
    string Pattern,
    LocalizedTextDto PatternLabel,
    string Category,
    LocalizedTextDto CategoryLabel,
    IReadOnlyList<FabricPhotoDto> Photos);

/// <summary>A selectable filter value with its bilingual label.</summary>
public sealed record FacetOptionDto(string Value, string LabelAr, string LabelEn);

/// <summary>Distinct filter values present in the visible catalogue.</summary>
public sealed record FabricFacetsDto(
    IReadOnlyList<FacetOptionDto> Colors,
    IReadOnlyList<FacetOptionDto> Patterns,
    IReadOnlyList<FacetOptionDto> Materials,
    IReadOnlyList<FacetOptionDto> Categories);

/// <summary>Body of create / update requests. Pattern and category are sent as codes; their labels are server-owned.</summary>
public sealed record UpsertFabricRequest(
    string? NameAr,
    string? NameEn,
    string? DescriptionAr,
    string? DescriptionEn,
    decimal PricePerMeter,
    decimal StockMeters,
    string? Color,
    LocalizedTextDto? ColorLabel,
    string? Material,
    LocalizedTextDto? MaterialLabel,
    string? Pattern,
    string? Category,
    IReadOnlyList<FabricPhotoDto>? Photos,
    bool Hidden,
    string? CompositionAr = null,
    string? CompositionEn = null,
    decimal? WidthCm = null,
    int? WeightGsm = null,
    string? Season = null,
    string? CareAr = null,
    string? CareEn = null);

public sealed record SetFabricVisibilityRequest(bool Hidden);
