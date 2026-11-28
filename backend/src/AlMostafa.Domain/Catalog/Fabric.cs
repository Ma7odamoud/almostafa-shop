using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Catalog;

/// <summary>
/// A fabric sold by the metre. Aggregate root of the Catalog module.
/// </summary>
/// <remarks>
/// Business rules preserved from the original application:
/// <list type="bullet">
///   <item><c>PricePerMeter == 0</c> means "price upon inquiry".</item>
///   <item><c>StockMeters == 0</c> means "made to order" — it does NOT block ordering.</item>
///   <item>The first photo is the card/draped image, the second the mannequin/hover image.</item>
///   <item>Hidden fabrics are invisible to customers and cannot be ordered.</item>
/// </list>
/// </remarks>
public sealed class Fabric
{
    public const int MaxIdLength = 64;
    public const int MaxNameLength = 200;
    public const int MaxDescriptionLength = 4000;
    public const int MaxPhotos = 12;
    public const decimal MaxPrice = 1_000_000m;
    public const decimal MaxStock = 1_000_000m;

    private List<FabricPhoto> _photos = [];

    // Required by EF Core.
    private Fabric()
    {
        Id = string.Empty;
        Name = LocalizedText.Empty;
        Description = LocalizedText.Empty;
        Color = null!;
        Material = null!;
        Pattern = null!;
        Category = null!;
    }

    private Fabric(string id, DateTimeOffset now) : this()
    {
        Id = id;
        CreatedAt = now;
    }

    public string Id { get; private set; }
    public LocalizedText Name { get; private set; }
    public LocalizedText Description { get; private set; }
    public decimal PricePerMeter { get; private set; }
    public decimal StockMeters { get; private set; }
    public FabricAttribute Color { get; private set; }
    public FabricAttribute Material { get; private set; }
    public FabricAttribute Pattern { get; private set; }
    public FabricAttribute Category { get; private set; }
    public IReadOnlyList<FabricPhoto> Photos => _photos;
    public bool Hidden { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public bool HasPrice => PricePerMeter > 0;

    public static Fabric Create(string id, FabricDetails details, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length > MaxIdLength)
            throw new DomainException("invalid_id", $"Fabric id is required and must be at most {MaxIdLength} characters.");

        var fabric = new Fabric(id.Trim(), now);
        fabric.Update(details, now);
        return fabric;
    }

    public void Update(FabricDetails details, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(details);

        if (details.Name.IsEmpty)
            throw new DomainException("name_required", "Please provide at least a name in English or Arabic.");
        if (details.Photos.Count > MaxPhotos)
            throw new DomainException("too_many_photos", $"A fabric can have at most {MaxPhotos} photos.");

        Name = details.Name.EnsureMaxLength(MaxNameLength, "name");
        Description = details.Description.EnsureMaxLength(MaxDescriptionLength, "description");
        PricePerMeter = decimal.Round(Guard.NonNegative(details.PricePerMeter, MaxPrice, "price_per_meter"), 2);
        StockMeters = decimal.Round(Guard.NonNegative(details.StockMeters, MaxStock, "stock_meters"), 2);
        Color = details.Color;
        Material = details.Material;
        Pattern = FabricTaxonomy.Pattern(details.PatternCode);
        Category = FabricTaxonomy.Category(details.CategoryCode);
        _photos = [.. details.Photos];
        Hidden = details.Hidden;
        UpdatedAt = now;
    }

    public void SetVisibility(bool hidden, DateTimeOffset now)
    {
        Hidden = hidden;
        UpdatedAt = now;
    }
}

/// <summary>All editable data of a fabric. Pattern and category are referenced by code only.</summary>
public sealed record FabricDetails(
    LocalizedText Name,
    LocalizedText Description,
    decimal PricePerMeter,
    decimal StockMeters,
    FabricAttribute Color,
    FabricAttribute Material,
    string PatternCode,
    string CategoryCode,
    IReadOnlyList<FabricPhoto> Photos,
    bool Hidden);
