using AlMostafa.Domain.Common;

namespace AlMostafa.Application.Common;

public sealed record LocalizedTextDto(string Ar, string En)
{
    public static LocalizedTextDto From(LocalizedText text) => new(text.Ar, text.En);

    public LocalizedText ToDomain() => new(Ar, En);
}
