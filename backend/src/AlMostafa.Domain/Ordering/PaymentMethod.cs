using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Ordering;

/// <summary>Payment methods offered at checkout. Stored by code (kebab-case) to match the existing data.</summary>
public static class PaymentMethods
{
    public const string CashOnDelivery = "cod";
    public const string BankTransfer = "bank-transfer";
    public const string Card = "card";

    public static IReadOnlyList<string> All { get; } = [CashOnDelivery, BankTransfer, Card];

    public static string Normalize(string? code)
    {
        var normalized = (code ?? string.Empty).Trim().ToLowerInvariant();
        return All.Contains(normalized)
            ? normalized
            : throw new DomainException("invalid_payment_method",
                $"Unknown payment method '{code}'. Allowed: {string.Join(", ", All)}.");
    }
}
