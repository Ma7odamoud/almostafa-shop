using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;

namespace AlMostafa.IntegrationTests;

public class PerformanceFeatureTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static object Fabric(string nameEn, string nameAr, decimal price, string category = "suit", string material = "wool", string color = "navy") => new
    {
        nameAr, nameEn, pricePerMeter = price, stockMeters = 0,
        color, colorLabel = new { ar = "لون", en = color },
        material, materialLabel = new { ar = "خامة", en = material },
        pattern = "plain", category, photos = Array.Empty<object>(), hidden = false,
    };

    [Fact]
    public async Task Cached_listing_is_refreshed_immediately_after_an_admin_change()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var anon = factory.CreateClient();
        var id = (await (await admin.PostAsJsonAsync("/api/v1/admin/fabrics", Fabric("Cache Probe Cloth", "قماش", 100m), ct)).JsonAsync()).GetProperty("id").GetString();

        async Task<decimal?> PublicPrice()
        {
            var list = await (await anon.GetAsync("/api/v1/fabrics?search=cache%20probe", ct)).JsonAsync();
            return list.GetProperty("items").EnumerateArray().Select(f => (decimal?)f.GetProperty("pricePerMeter").GetDecimal()).FirstOrDefault();
        }

        Assert.Equal(100m, await PublicPrice());
        Assert.Equal(100m, await PublicPrice()); // served from cache
        await admin.PutAsJsonAsync($"/api/v1/admin/fabrics/{id}", Fabric("Cache Probe Cloth", "قماش", 250m), ct);
        Assert.Equal(250m, await PublicPrice());

        await admin.PatchAsJsonAsync($"/api/v1/admin/fabrics/{id}/visibility", new { hidden = true }, ct);
        Assert.Null(await PublicPrice());
        Assert.Equal(HttpStatusCode.NotFound, (await anon.GetAsync($"/api/v1/fabrics/{id}", ct)).StatusCode);
    }

    [Fact]
    public async Task Listing_returns_card_sized_summaries_without_descriptions()
    {
        var item = (await (await factory.CreateClient().GetAsync("/api/v1/fabrics?pageSize=1", TestContext.Current.CancellationToken)).JsonAsync())
            .GetProperty("items")[0];

        Assert.True(item.TryGetProperty("nameEn", out _));
        Assert.True(item.TryGetProperty("photos", out _));
        Assert.False(item.TryGetProperty("descriptionEn", out _));
        Assert.False(item.TryGetProperty("compositionEn", out _));
    }

    [Theory]
    [InlineData("أزرق")]
    [InlineData("ازرق")]
    [InlineData("اَزْرَق")]
    public async Task Arabic_search_matches_common_spelling_variants(string query)
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        await admin.PostAsJsonAsync("/api/v1/admin/fabrics", Fabric("Royal Blue Linen", "كتان أزرق ملكي", 90m, material: "linen"), ct);

        var body = await (await factory.CreateClient().GetAsync("/api/v1/fabrics?search=" + Uri.EscapeDataString(query), ct)).JsonAsync();
        Assert.Contains(body.GetProperty("items").EnumerateArray(), f => f.GetProperty("nameEn").GetString() == "Royal Blue Linen");
    }

    [Fact]
    public async Task Similar_fabrics_rank_same_category_and_material_first_and_exclude_the_fabric_itself()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        async Task<string> Create(string name, string category, string material, string color) =>
            (await (await admin.PostAsJsonAsync("/api/v1/admin/fabrics", Fabric(name, "ق", 10m, category, material, color), ct)).JsonAsync()).GetProperty("id").GetString()!;

        var target = await Create("Sim Target", "coat", "mohair", "olive");
        var best = await Create("Sim Best", "coat", "mohair", "olive");
        var sameCategory = await Create("Sim Category", "coat", "silk", "white");
        await Create("Sim Unrelated", "trousers", "cotton", "white");

        var similar = await (await factory.CreateClient().GetAsync($"/api/v1/fabrics/{target}/similar?limit=4", ct)).JsonAsync();
        var ids = similar.EnumerateArray().Select(f => f.GetProperty("id").GetString()).ToList();

        Assert.Equal(best, ids[0]);
        Assert.Contains(sameCategory, ids);
        Assert.DoesNotContain(target, ids);
        Assert.DoesNotContain(similar.EnumerateArray(), f => f.GetProperty("nameEn").GetString() == "Sim Unrelated");
    }

    [Fact]
    public async Task Repeating_an_order_submission_with_the_same_key_creates_one_order()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = factory.CreateClient();
        var key = Guid.NewGuid().ToString();
        var body = new { items = new[] { new { fabricId = "fab-001", meters = 2m } }, name = "Idem", phone = "01012345678", governorate = "cairo", area = "Maadi", address = "x", paymentMethod = "cod" };
        HttpRequestMessage Request() => new(HttpMethod.Post, "/api/v1/orders") { Content = JsonContent.Create(body), Headers = { { "Idempotency-Key", key } } };

        // A double tap: two submissions racing, then a later retry.
        var raced = await Task.WhenAll(client.SendAsync(Request(), ct), client.SendAsync(Request(), ct));
        var retry = await client.SendAsync(Request(), ct);

        var ids = new List<string?>();
        foreach (var r in raced.Append(retry))
        {
            Assert.True(r.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK, r.StatusCode.ToString());
            ids.Add((await r.JsonAsync()).GetProperty("orderId").GetString());
        }
        Assert.Single(ids.Distinct());
        Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
        Assert.Equal(1, await factory.WithDbAsync(db => db.Orders.CountAsync(o => o.IdempotencyKey == key, ct)));
    }

    [Fact]
    public async Task Upload_creates_responsive_sizes_and_keeps_a_private_original()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var bytes = await File.ReadAllBytesAsync(Path.Combine(AppContext.BaseDirectory, "Fixtures", "large-4000x3000.jpg"), ct);
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");

        var url = (await (await admin.PostAsync("/api/v1/admin/uploads", new MultipartFormDataContent { { file, "file", "x.jpg" } }, ct)).JsonAsync()).GetProperty("url").GetString()!;
        var anon = factory.CreateClient();

        foreach (var width in new[] { 480, 960 })
        {
            var variant = await anon.GetAsync(url.Replace(".webp", $"-{width}.webp", StringComparison.Ordinal), ct);
            Assert.Equal(HttpStatusCode.OK, variant.StatusCode);
            using var bitmap = SkiaSharp.SKBitmap.Decode(await variant.Content.ReadAsByteArrayAsync(ct));
            Assert.Equal(width, bitmap.Width);
        }
        // The untouched original is stored privately and is not reachable over HTTP.
        Assert.Equal(HttpStatusCode.NotFound, (await anon.GetAsync(url.Replace(".webp", ".jpg", StringComparison.Ordinal), ct)).StatusCode);
        Assert.True(File.Exists(Path.Combine(factory.OriginalsPath, Path.GetFileNameWithoutExtension(url) + ".jpg")));
    }
}
