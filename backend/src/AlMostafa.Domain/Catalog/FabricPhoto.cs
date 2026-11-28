using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Catalog;

/// <summary>
/// A fabric photo. <see cref="Src"/> must be a site-relative path (e.g. <c>/uploads/abc.jpg</c>)
/// so the storefront never renders attacker-controlled external or <c>javascript:</c> URLs.
/// </summary>
public sealed record FabricPhoto
{
    public const int MaxSrcLength = 500;
    public const int MaxAltLength = 200;

    public FabricPhoto(string src, string? alt)
    {
        var value = Guard.Text(src, MaxSrcLength, "photo_src");
        if (!IsSafeRelativePath(value))
            throw new DomainException("invalid_photo_src", "Photo source must be a site-relative path such as /uploads/photo.jpg.");
        Src = value;
        Alt = Guard.Text(alt, MaxAltLength, "photo_alt");
    }

    // Required by EF Core.
    private FabricPhoto()
    {
        Src = string.Empty;
        Alt = string.Empty;
    }

    public string Src { get; }
    public string Alt { get; }

    private static bool IsSafeRelativePath(string value) =>
        value.Length > 1
        && value[0] == '/'
        && value[1] != '/'
        && !value.Contains('\\', StringComparison.Ordinal)
        && !value.Contains("..", StringComparison.Ordinal)
        && value.All(c => !char.IsWhiteSpace(c) && !char.IsControl(c));
}
