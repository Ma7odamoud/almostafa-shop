using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Ordering;

/// <summary>An order line. Name and price are snapshots taken when the order was placed.</summary>
public sealed class OrderItem
{
    public const decimal MinMeters = 0.5m;
    public const decimal MaxMeters = 500m;

    // Required by EF Core.
    private OrderItem()
    {
        FabricId = string.Empty;
        FabricName = LocalizedText.Empty;
    }

    internal OrderItem(string fabricId, LocalizedText fabricName, decimal meters, decimal pricePerMeter) : this()
    {
        if (meters < MinMeters || meters > MaxMeters)
            throw new DomainException("invalid_meters", $"Meters must be between {MinMeters} and {MaxMeters}.");

        FabricId = fabricId;
        FabricName = fabricName;
        Meters = decimal.Round(meters, 2);
        PricePerMeter = pricePerMeter;
    }

    public int Id { get; private set; }
    public string FabricId { get; private set; }
    public LocalizedText FabricName { get; private set; }
    public decimal Meters { get; private set; }
    public decimal PricePerMeter { get; private set; }
    public decimal LineTotal => decimal.Round(Meters * PricePerMeter, 2);
}
