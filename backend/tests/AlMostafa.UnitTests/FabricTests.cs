using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Common;

namespace AlMostafa.UnitTests;

public class FabricTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    internal static FabricDetails Details(
        string nameEn = "Navy Wool", string pattern = "plain", string category = "suit",
        decimal price = 10, decimal stock = 0, IReadOnlyList<FabricPhoto>? photos = null, bool hidden = false) =>
        new(new LocalizedText("صوف", nameEn), new LocalizedText("", ""), price, stock,
            new FabricAttribute("Navy ", new LocalizedText("كحلي", "Navy")),
            new FabricAttribute("wool", new LocalizedText("صوف", "Wool")),
            pattern, category, photos ?? [], hidden);

    [Fact]
    public void Create_derives_pattern_and_category_labels_from_taxonomy()
    {
        var fabric = Fabric.Create("fab-1", Details(pattern: "CHECKS", category: "coat"), Now);

        Assert.Equal("checks", fabric.Pattern.Code);
        Assert.Equal("Checks", fabric.Pattern.Label.En);
        Assert.Equal("معطف", fabric.Category.Label.Ar);
        Assert.Equal("navy", fabric.Color.Code); // codes are trimmed + lower-cased
        Assert.Equal(Now, fabric.CreatedAt);
    }

    [Fact]
    public void Create_requires_a_name_in_at_least_one_language()
    {
        var details = Details() with { Name = new LocalizedText(" ", "") };

        var ex = Assert.Throws<DomainException>(() => Fabric.Create("fab-1", details, Now));
        Assert.Equal("name_required", ex.Code);
    }

    [Theory]
    [InlineData("zigzag", "suit", "invalid_pattern")]
    [InlineData("plain", "hat", "invalid_category")]
    public void Create_rejects_unknown_taxonomy_codes(string pattern, string category, string code)
    {
        var ex = Assert.Throws<DomainException>(() => Fabric.Create("fab-1", Details(pattern: pattern, category: category), Now));
        Assert.Equal(code, ex.Code);
    }

    [Theory]
    [InlineData(-1, 0)]
    [InlineData(0, -0.5)]
    public void Create_rejects_negative_price_or_stock(decimal price, decimal stock)
    {
        Assert.Throws<DomainException>(() => Fabric.Create("fab-1", Details(price: price, stock: stock), Now));
    }

    [Fact]
    public void Zero_stock_is_allowed_because_it_means_made_to_order()
    {
        var fabric = Fabric.Create("fab-1", Details(stock: 0), Now);
        Assert.Equal(0, fabric.StockMeters);
    }

    [Fact]
    public void Create_limits_number_of_photos()
    {
        var photos = Enumerable.Range(0, Fabric.MaxPhotos + 1).Select(i => new FabricPhoto($"/uploads/{i}.jpg", "")).ToList();
        var ex = Assert.Throws<DomainException>(() => Fabric.Create("fab-1", Details(photos: photos), Now));
        Assert.Equal("too_many_photos", ex.Code);
    }

    [Fact]
    public void SetVisibility_updates_hidden_flag_and_timestamp()
    {
        var fabric = Fabric.Create("fab-1", Details(), Now);
        fabric.SetVisibility(true, Now.AddHours(1));

        Assert.True(fabric.Hidden);
        Assert.Equal(Now.AddHours(1), fabric.UpdatedAt);
    }

    [Theory]
    [InlineData("/uploads/a.jpg", true)]
    [InlineData("/demo/fabric-draped-placeholder.svg", true)]
    [InlineData("https://evil.example/x.jpg", false)]
    [InlineData("//evil.example/x.jpg", false)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("/uploads/../../etc/passwd", false)]
    [InlineData("/uploads/a b.jpg", false)]
    public void FabricPhoto_only_accepts_site_relative_paths(string src, bool valid)
    {
        if (valid)
            Assert.Equal(src, new FabricPhoto(src, "alt").Src);
        else
            Assert.Throws<DomainException>(() => new FabricPhoto(src, "alt"));
    }
}
