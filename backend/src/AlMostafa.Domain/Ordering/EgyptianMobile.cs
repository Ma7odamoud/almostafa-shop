using AlMostafa.Domain.Common;

namespace AlMostafa.Domain.Ordering;

/// <summary>Egyptian mobile numbers (010, 011, 012, 015), stored in international form: +201XXXXXXXXX.</summary>
public static class EgyptianMobile
{
    public static bool TryNormalize(string? input, out string normalized)
    {
        normalized = string.Empty;
        if (string.IsNullOrWhiteSpace(input)) return false;

        // Accept Arabic-Indic digits, spaces, dashes, brackets and the +20 / 0020 / 20 prefixes.
        var digits = new string(input.Select(ToAsciiDigit).Where(char.IsAsciiDigit).ToArray());
        if (digits.StartsWith("0020", StringComparison.Ordinal)) digits = "0" + digits[4..];
        else if (digits.StartsWith("20", StringComparison.Ordinal) && digits.Length == 12) digits = "0" + digits[2..];

        if (digits.Length != 11 || !digits.StartsWith("01", StringComparison.Ordinal) || "0125".IndexOf(digits[2]) < 0)
            return false;

        normalized = "+2" + digits;
        return true;
    }

    public static string Normalize(string? input) =>
        TryNormalize(input, out var normalized)
            ? normalized
            : throw new DomainException("invalid_phone", "Please enter a valid Egyptian mobile number, e.g. 01012345678.");

    private static char ToAsciiDigit(char c) => c switch
    {
        >= '٠' and <= '٩' => (char)('0' + (c - '٠')), // Arabic-Indic
        >= '۰' and <= '۹' => (char)('0' + (c - '۰')), // Extended Arabic-Indic
        _ => c,
    };
}
