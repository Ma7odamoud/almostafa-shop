using AlMostafa.Application.Catalog;
using AlMostafa.Application.Common;
using AlMostafa.Application.Media;
using AlMostafa.Application.Ordering;

namespace AlMostafa.UnitTests;

public class ApplicationTests
{
    [Theory]
    [InlineData(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, "jpg")]
    [InlineData(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, "png")]
    [InlineData(new byte[] { (byte)'G', (byte)'I', (byte)'F', (byte)'8', (byte)'9', (byte)'a' }, null)]
    [InlineData(new byte[] { (byte)'R', (byte)'I', (byte)'F', (byte)'F', 0, 0, 0, 0, (byte)'W', (byte)'E', (byte)'B', (byte)'P' }, "webp")]
    [InlineData(new byte[] { (byte)'<', (byte)'h', (byte)'t', (byte)'m', (byte)'l', (byte)'>' }, null)]
    [InlineData(new byte[] { (byte)'<', (byte)'s', (byte)'v', (byte)'g' }, null)]
    public void DetectImageExtension_uses_magic_bytes(byte[] header, string? expected)
    {
        Assert.Equal(expected, MediaService.DetectImageExtension(header));
    }

    [Fact]
    public void Search_criteria_are_normalised_and_clamped()
    {
        var c = CatalogService.Normalize(new FabricSearchCriteria
        {
            Search = "   ",
            Colors = [" Navy", "navy", ""],
            Page = -3,
            PageSize = 10_000,
        });

        Assert.Null(c.Search);
        Assert.Equal(["navy"], c.Colors);
        Assert.Equal(1, c.Page);
        Assert.Equal(Paging.MaxPageSize, c.PageSize);
    }

    [Fact]
    public void PlaceOrderRequestValidator_reports_every_invalid_field()
    {
        var result = new PlaceOrderRequestValidator().Validate(new PlaceOrderRequest([], "", "123", "bad", "alexandria", "", null, "paypal"));

        var fields = result.Errors.Select(e => e.PropertyName).ToHashSet();
        Assert.Contains("Name", fields);
        Assert.Contains("Address", fields);
        Assert.Contains("PaymentMethod", fields);
        Assert.Contains("Items", fields);
        Assert.Contains("Phone", fields);
        Assert.Contains("Email", fields);
        Assert.Contains("Governorate", fields);
        Assert.Contains("Area", fields);
    }

    [Fact]
    public void UpsertFabricRequestValidator_accepts_the_admin_form_payload()
    {
        var request = new UpsertFabricRequest("صوف", "Wool", "", "", 0, 0, "", new LocalizedTextDto("", ""), "", null,
            "plain", "suit", [new FabricPhotoDto("/uploads/a.jpg", "a.jpg")], false);

        Assert.True(new UpsertFabricRequestValidator().Validate(request).IsValid);
    }

    [Fact]
    public void PagedResult_computes_total_pages()
    {
        Assert.Equal(3, new PagedResult<int>([], 1, 10, 21).TotalPages);
        Assert.Equal(0, new PagedResult<int>([], 1, 10, 0).TotalPages);
    }
}
