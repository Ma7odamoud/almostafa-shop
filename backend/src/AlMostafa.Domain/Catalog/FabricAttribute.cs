using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Catalog;

/// <summary>
/// A filterable fabric attribute: a stable code (used for filtering / URLs) plus a bilingual display label.
/// Used for colour, material, pattern and category.
/// </summary>
public sealed record FabricAttribute
{
    public const int MaxCodeLength = 50;
    public const int MaxLabelLength = 100;

    public FabricAttribute(string? code, LocalizedText label)
    {
        Code = Guard.Text(code, MaxCodeLength, "attribute_code").ToLowerInvariant();
        Label = label.EnsureMaxLength(MaxLabelLength, "attribute_label");
    }

    // Required by EF Core.
    private FabricAttribute()
    {
        Code = string.Empty;
        Label = LocalizedText.Empty;
    }

    public string Code { get; }
    public LocalizedText Label { get; }
}
