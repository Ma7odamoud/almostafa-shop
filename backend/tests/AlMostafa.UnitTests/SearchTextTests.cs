using AlMostafa.Domain.Catalog;

namespace AlMostafa.UnitTests;

public class SearchTextTests
{
    [Theory]
    [InlineData("أزرق", "ازرق")]
    [InlineData("إسطنبول", "اسطنبول")]
    [InlineData("آمن", "امن")]
    [InlineData("بدلة", "بدله")]
    [InlineData("مستوى", "مستوي")]
    [InlineData("صُوفٌ", "صوف")]          // diacritics
    [InlineData("صـــوف", "صوف")]         // tatweel
    [InlineData("رقم ١٢٠", "رقم 120")]   // Arabic-Indic digits
    [InlineData("  Navy   MERINO ", "navy merino")]
    public void Normalize_makes_spelling_variants_equal(string input, string expected)
    {
        Assert.Equal(expected, SearchText.Normalize(input));
    }

    [Fact]
    public void Fabric_search_text_covers_names_labels_and_composition()
    {
        var spec = new FabricSpecifications(new AlMostafa.Domain.Common.LocalizedText("", "Super 120s"), null, null, null, null);
        var fabric = Fabric.Create("fab-1", FabricTests.Details(nameEn: "Navy Wool") with { Specifications = spec }, DateTimeOffset.UnixEpoch);

        Assert.Contains("navy wool", fabric.SearchText, StringComparison.Ordinal);
        Assert.Contains("كحلي", fabric.SearchText, StringComparison.Ordinal);   // colour label
        Assert.Contains("بدله", fabric.SearchText, StringComparison.Ordinal);   // category label, normalised
        Assert.Contains("super 120s", fabric.SearchText, StringComparison.Ordinal);
    }
}
