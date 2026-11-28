using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Ordering;

/// <summary>
/// Payment methods offered at checkout. No online payment provider is connected yet:
/// every order is confirmed by phone, where non-cash payment is arranged.
/// </summary>
public static class PaymentMethods
{
    public const string CashOnDelivery = "cod";
    public const string MobileWallet = "wallet";
    public const string Card = "card";

    public static IReadOnlyList<PaymentOption> All { get; } =
    [
        new(CashOnDelivery, new LocalizedText("الدفع عند الاستلام", "Cash on Delivery")),
        new(MobileWallet, new LocalizedText("محفظة إلكترونية", "Mobile Wallet")),
        new(Card, new LocalizedText("فيزا / بطاقة بنكية", "Visa / Card")),
    ];

    public static string Normalize(string? code)
    {
        var normalized = (code ?? string.Empty).Trim().ToLowerInvariant();
        return All.Any(o => o.Code == normalized)
            ? normalized
            : throw new DomainException("invalid_payment_method",
                $"Unknown payment method '{code}'. Allowed: {string.Join(", ", All.Select(o => o.Code))}.");
    }

    public sealed record PaymentOption(string Code, LocalizedText Label);
}
