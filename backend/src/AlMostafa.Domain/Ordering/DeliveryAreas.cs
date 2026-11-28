using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Ordering;

/// <summary>Governorates the store currently delivers to.</summary>
public static class DeliveryAreas
{
    public static IReadOnlyList<Governorate> Governorates { get; } =
    [
        new("cairo", new LocalizedText("القاهرة", "Cairo")),
        new("giza", new LocalizedText("الجيزة", "Giza")),
    ];

    public static string Normalize(string? code)
    {
        var normalized = (code ?? string.Empty).Trim().ToLowerInvariant();
        return Governorates.Any(g => g.Code == normalized)
            ? normalized
            : throw new DomainException("invalid_governorate",
                $"We currently deliver to: {string.Join(", ", Governorates.Select(g => g.Label.En))}.");
    }

    public sealed record Governorate(string Code, LocalizedText Label);
}
