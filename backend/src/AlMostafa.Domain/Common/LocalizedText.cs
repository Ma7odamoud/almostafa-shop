namespace AlMostafa.Domain.Common;

/// <summary>Bilingual (Arabic / English) text value object. The store is Arabic-first with an English variant.</summary>
public sealed record LocalizedText
{
    public LocalizedText(string? ar, string? en)
    {
        Ar = (ar ?? string.Empty).Trim();
        En = (en ?? string.Empty).Trim();
    }

    // Required by EF Core.
    private LocalizedText() : this(string.Empty, string.Empty) { }

    public string Ar { get; }
    public string En { get; }

    public bool IsEmpty => Ar.Length == 0 && En.Length == 0;

    public static LocalizedText Empty { get; } = new(string.Empty, string.Empty);

    internal LocalizedText EnsureMaxLength(int maxLength, string field)
    {
        if (Ar.Length > maxLength || En.Length > maxLength)
            throw new DomainException("invalid_" + field, $"{field} must be at most {maxLength} characters per language.");
        return this;
    }
}
