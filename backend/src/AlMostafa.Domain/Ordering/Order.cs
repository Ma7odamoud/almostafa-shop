using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Ordering;

/// <summary>
/// A customer order. Aggregate root of the Ordering module.
/// The total is always computed from the lines — it is never accepted from the client.
/// </summary>
public sealed class Order
{
    public const int MaxIdLength = 64;
    public const int MaxNameLength = 200;
    public const int MaxAddressLength = 1000;
    public const int MaxItems = 50;

    private readonly List<OrderItem> _items = [];

    // Required by EF Core.
    private Order()
    {
        Id = string.Empty;
        CustomerName = string.Empty;
        ShippingAddress = string.Empty;
        PaymentMethod = string.Empty;
    }

    public string Id { get; private set; }
    public string CustomerName { get; private set; }
    public string ShippingAddress { get; private set; }
    public string PaymentMethod { get; private set; }
    public OrderStatus Status { get; private set; }
    public decimal Total { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public IReadOnlyList<OrderItem> Items => _items;

    public static Order Place(
        string id,
        string customerName,
        string shippingAddress,
        string paymentMethod,
        IEnumerable<OrderLine> lines,
        DateTimeOffset now)
    {
        var order = new Order
        {
            Id = id,
            CustomerName = Guard.Text(customerName, MaxNameLength, "name"),
            ShippingAddress = Guard.Text(shippingAddress, MaxAddressLength, "address"),
            PaymentMethod = PaymentMethods.Normalize(paymentMethod),
            Status = OrderStatus.Pending,
            CreatedAt = now,
        };

        if (order.CustomerName.Length == 0)
            throw new DomainException("name_required", "Name is required.");
        if (order.ShippingAddress.Length == 0)
            throw new DomainException("address_required", "Address is required.");

        foreach (var line in lines)
            order.AddLine(line);

        if (order._items.Count == 0)
            throw new DomainException("empty_order", "An order must contain at least one item.");

        return order;
    }

    /// <summary>Rehydrates an order from the legacy JSON store, preserving its original id, date and amounts.</summary>
    public static Order Import(
        string id,
        string customerName,
        string shippingAddress,
        string paymentMethod,
        decimal total,
        DateTimeOffset createdAt,
        IEnumerable<OrderLine> lines)
    {
        var order = new Order
        {
            Id = id,
            CustomerName = Guard.Text(customerName, MaxNameLength, "name"),
            ShippingAddress = Guard.Text(shippingAddress, MaxAddressLength, "address"),
            PaymentMethod = (paymentMethod ?? string.Empty).Trim(),
            Status = OrderStatus.Pending,
            CreatedAt = createdAt,
            Total = total,
        };
        foreach (var line in lines)
            order._items.Add(new OrderItem(line.FabricId, line.FabricName, Math.Max(line.Meters, OrderItem.MinMeters), line.PricePerMeter));
        return order;
    }

    private void AddLine(OrderLine line)
    {
        if (_items.Count >= MaxItems)
            throw new DomainException("too_many_items", $"An order can contain at most {MaxItems} items.");
        if (_items.Any(i => i.FabricId == line.FabricId))
            throw new DomainException("duplicate_item", $"Fabric '{line.FabricId}' appears more than once.");

        _items.Add(new OrderItem(line.FabricId, line.FabricName, line.Meters, line.PricePerMeter));
        Total = _items.Sum(i => i.LineTotal);
    }
}

/// <summary>Input for an order line, already priced from the catalogue.</summary>
public sealed record OrderLine(string FabricId, LocalizedText FabricName, decimal Meters, decimal PricePerMeter);
