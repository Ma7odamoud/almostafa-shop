using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Catalog;

/// <summary>
/// Technical details a tailor relies on. Every field is optional: the storefront shows only what was
/// actually entered, never an estimate.
/// </summary>
public sealed record FabricSpecifications
{
    public const int MaxTextLength = 200;
    public const decimal MinWidthCm = 50m, MaxWidthCm = 400m;
    public const int MinWeightGsm = 50, MaxWeightGsm = 1500;

    public FabricSpecifications(LocalizedText? composition, decimal? widthCm, int? weightGsm, string? season, LocalizedText? care)
    {
        Composition = (composition ?? LocalizedText.Empty).EnsureMaxLength(MaxTextLength, "composition");
        Care = (care ?? LocalizedText.Empty).EnsureMaxLength(MaxTextLength, "care");

        if (widthCm is { } w && (w < MinWidthCm || w > MaxWidthCm))
            throw new DomainException("invalid_width", $"Width must be between {MinWidthCm} and {MaxWidthCm} cm.");
        if (weightGsm is { } g && (g < MinWeightGsm || g > MaxWeightGsm))
            throw new DomainException("invalid_weight", $"Weight must be between {MinWeightGsm} and {MaxWeightGsm} g/m.");

        WidthCm = widthCm is { } width ? decimal.Round(width, 1) : null;
        WeightGsm = weightGsm;
        Season = string.IsNullOrWhiteSpace(season) ? null : FabricTaxonomy.Season(season).Code;
    }

    // Required by EF Core.
    private FabricSpecifications()
    {
        Composition = LocalizedText.Empty;
        Care = LocalizedText.Empty;
    }

    public static FabricSpecifications None { get; } = new(null, null, null, null, null);

    /// <summary>e.g. "100% wool, Super 120s".</summary>
    public LocalizedText Composition { get; }
    public decimal? WidthCm { get; }
    /// <summary>Grams per running metre.</summary>
    public int? WeightGsm { get; }
    /// <summary>A <see cref="FabricTaxonomy.Seasons"/> code, or null when not specified.</summary>
    public string? Season { get; }
    public LocalizedText Care { get; }
}
