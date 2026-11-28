using System.Text;

namespace AlMostafa.Domain.Catalog;

/// <summary>
/// Builds the normalised text a fabric is searched by, and normalises search queries the same way, so that
/// common Arabic spelling variants match: أ/إ/آ → ا, ى → ي, ة → ه, ؤ → و, ئ → ي, diacritics and tatweel removed,
/// Arabic-Indic digits → 0-9, Latin lower-cased, whitespace collapsed.
/// </summary>
public static class SearchText
{
    public const int MaxLength = 6000;

    public static string Build(params string?[] parts)
    {
        var text = Normalize(string.Join(' ', parts.Where(p => !string.IsNullOrWhiteSpace(p))));
        return text.Length <= MaxLength ? text : text[..MaxLength];
    }

    public static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;

        var sb = new StringBuilder(value.Length);
        var lastWasSpace = true;
        foreach (var raw in value)
        {
            var c = raw switch
            {
                'أ' or 'إ' or 'آ' or 'ٱ' => 'ا',
                'ى' => 'ي',
                'ة' => 'ه',
                'ؤ' => 'و',
                'ئ' => 'ي',
                >= '٠' and <= '٩' => (char)('0' + (raw - '٠')),
                >= '۰' and <= '۹' => (char)('0' + (raw - '۰')),
                _ => char.ToLowerInvariant(raw),
            };
            // Arabic diacritics (tashkeel), superscript alef and tatweel carry no search meaning.
            if (c is >= 'ً' and <= 'ٟ' or 'ٰ' or 'ـ') continue;
            if (char.IsWhiteSpace(c))
            {
                if (!lastWasSpace) sb.Append(' ');
                lastWasSpace = true;
                continue;
            }
            sb.Append(c);
            lastWasSpace = false;
        }
        return sb.ToString().TrimEnd();
    }
}
