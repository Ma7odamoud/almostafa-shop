namespace AlMostafa.Domain.Common;

internal static class Guard
{
    public static string Text(string? value, int maxLength, string field)
    {
        var trimmed = (value ?? string.Empty).Trim();
        if (trimmed.Length > maxLength)
            throw new DomainException("invalid_" + field, $"{field} must be at most {maxLength} characters.");
        return trimmed;
    }

    public static decimal NonNegative(decimal value, decimal max, string field)
    {
        if (value < 0 || value > max)
            throw new DomainException("invalid_" + field, $"{field} must be between 0 and {max}.");
        return value;
    }
}
