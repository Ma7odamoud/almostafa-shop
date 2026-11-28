namespace AlMostafa.Domain.Ordering;

/// <summary>
/// Order lifecycle. Only <see cref="Pending"/> is produced today (no payment provider yet);
/// the legacy JSON value "demo-pending" is imported as <see cref="Pending"/>.
/// </summary>
public enum OrderStatus
{
    Pending = 0,
}
