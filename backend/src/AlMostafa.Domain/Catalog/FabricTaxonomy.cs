using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Catalog;

/// <summary>
/// Canonical patterns and garment categories. Their labels are owned by the backend,
/// so clients only ever send the code.
/// </summary>
public static class FabricTaxonomy
{
    public static IReadOnlyList<FabricAttribute> Patterns { get; } =
    [
        new("plain", new LocalizedText("سادة", "Plain")),
        new("checks", new LocalizedText("مربعات", "Checks")),
        new("stripes", new LocalizedText("خطوط", "Stripes")),
        new("other", new LocalizedText("أنماط أخرى", "Other Patterns")),
    ];

    public static IReadOnlyList<FabricAttribute> Categories { get; } =
    [
        new("suit", new LocalizedText("بدلة", "Suit")),
        new("jacket", new LocalizedText("جاكيت", "Jacket")),
        new("trousers", new LocalizedText("بنطلون", "Trousers")),
        new("coat", new LocalizedText("معطف", "Coat")),
    ];

    public static FabricAttribute Pattern(string? code) => Find(Patterns, code, "pattern");

    public static FabricAttribute Category(string? code) => Find(Categories, code, "category");

    private static FabricAttribute Find(IReadOnlyList<FabricAttribute> list, string? code, string kind)
    {
        var normalized = (code ?? string.Empty).Trim().ToLowerInvariant();
        return list.FirstOrDefault(a => a.Code == normalized)
            ?? throw new DomainException("invalid_" + kind,
                $"Unknown {kind} '{code}'. Allowed: {string.Join(", ", list.Select(a => a.Code))}.");
    }
}
