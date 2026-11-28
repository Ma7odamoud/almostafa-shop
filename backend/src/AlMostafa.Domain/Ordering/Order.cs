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
    public const int MaxEmailLength = 256;
    public const int MaxAreaLength = 100;
    public const int MaxIdempotencyKeyLength = 64;
    public const int MaxItems = 50;

    private readonly List<OrderItem> _items = [];

    // Required by EF Core.
    private Order()
    {
        Id = string.Empty;
        CustomerName = string.Empty;
        CustomerPhone = string.Empty;
        Governorate = string.Empty;
        Area = string.Empty;
        ShippingAddress = string.Empty;
        PaymentMethod = string.Empty;
    }

    public string Id { get; private set; }
    public string CustomerName { get; private set; }

    /// <summary>Egyptian mobile in +201XXXXXXXXX form. Empty only on orders imported from the old store.</summary>
    public string CustomerPhone { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string Governorate { get; private set; }
    public string Area { get; private set; }
    public string ShippingAddress { get; private set; }
    public string PaymentMethod { get; private set; }
    public OrderStatus Status { get; private set; }
    public decimal Total { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    /// <summary>Client-generated key that makes resubmitting the same checkout safe (no duplicate orders).</summary>
    public string? IdempotencyKey { get; private set; }
    public IReadOnlyList<OrderItem> Items => _items;

    public static Order Place(string id, OrderCustomer customer, string paymentMethod, IEnumerable<OrderLine> lines, DateTimeOffset now,
        string? idempotencyKey = null)
    {
        ArgumentNullException.ThrowIfNull(customer);
        if (idempotencyKey is { Length: > MaxIdempotencyKeyLength })
            throw new DomainException("invalid_idempotency_key", $"Idempotency key must be at most {MaxIdempotencyKeyLength} characters.");

        var order = new Order
        {
            Id = id,
            CustomerName = Guard.Text(customer.Name, MaxNameLength, "name"),
            CustomerPhone = EgyptianMobile.Normalize(customer.Phone),
            CustomerEmail = NormalizeEmail(customer.Email),
            Governorate = DeliveryAreas.Normalize(customer.Governorate),
            Area = Guard.Text(customer.Area, MaxAreaLength, "area"),
            ShippingAddress = Guard.Text(customer.Address, MaxAddressLength, "address"),
            PaymentMethod = PaymentMethods.Normalize(paymentMethod),
            Status = OrderStatus.Pending,
            CreatedAt = now,
            IdempotencyKey = string.IsNullOrWhiteSpace(idempotencyKey) ? null : idempotencyKey.Trim(),
        };

        if (order.CustomerName.Length == 0)
            throw new DomainException("name_required", "Name is required.");
        if (order.Area.Length == 0)
            throw new DomainException("area_required", "Area is required.");
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

    private static string? NormalizeEmail(string? email)
    {
        var value = (email ?? string.Empty).Trim();
        if (value.Length == 0) return null;
        var at = value.IndexOf('@', StringComparison.Ordinal);
        if (value.Length > MaxEmailLength || at <= 0 || at != value.LastIndexOf('@') || !value[(at + 1)..].Contains('.', StringComparison.Ordinal))
            throw new DomainException("invalid_email", "Please enter a valid email address or leave it empty.");
        return value;
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

/// <summary>Who the order is for and where it goes. Phone is required: every order is confirmed by phone.</summary>
public sealed record OrderCustomer(string? Name, string? Phone, string? Email, string? Governorate, string? Area, string? Address);

/// <summary>Input for an order line, already priced from the catalogue.</summary>
public sealed record OrderLine(string FabricId, LocalizedText FabricName, decimal Meters, decimal PricePerMeter);
