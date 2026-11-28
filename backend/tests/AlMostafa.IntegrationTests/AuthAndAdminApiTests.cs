using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using SkiaSharp;

namespace AlMostafa.IntegrationTests;

public class AuthAndAdminApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Login_sets_a_strict_httponly_session_cookie()
    {
        var response = await factory.CreateCookieClient().PostAsJsonAsync("/api/v1/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var cookie = Assert.Single(response.Headers.GetValues("Set-Cookie"), c => c.StartsWith("almostafa_session=", StringComparison.Ordinal));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", cookie, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Wrong_password_is_rejected_with_generic_error()
    {
        var response = await factory.CreateCookieClient().PostAsJsonAsync("/api/v1/auth/login",
            new { email = ApiFactory.AdminEmail, password = "definitely-wrong" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("invalid_credentials", (await response.JsonAsync()).GetProperty("code").GetString());
    }

    [Fact]
    public async Task Admin_password_is_stored_hashed()
    {
        var hash = await factory.WithDbAsync(db => Task.FromResult(db.Users.Single().PasswordHash));
        Assert.NotNull(hash);
        Assert.DoesNotContain(ApiFactory.AdminPassword, hash, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("GET", "/api/v1/admin/fabrics")]
    [InlineData("GET", "/api/v1/admin/orders")]
    [InlineData("POST", "/api/v1/admin/fabrics")]
    [InlineData("DELETE", "/api/v1/admin/fabrics/fab-001")]
    [InlineData("GET", "/api/v1/auth/me")]
    public async Task Admin_endpoints_require_authentication(string method, string url)
    {
        var response = await factory.CreateClient().SendAsync(new HttpRequestMessage(new HttpMethod(method), url), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task State_changing_admin_requests_require_csrf_token()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = factory.CreateCookieClient();
        await client.PostAsJsonAsync("/api/v1/auth/login", new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword }, ct);

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/admin/fabrics", ct)).StatusCode);
        var response = await client.PostAsJsonAsync("/api/v1/admin/fabrics", TestHelpers.NewFabric(), ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("invalid_csrf_token", (await response.JsonAsync()).GetProperty("code").GetString());
    }

    [Fact]
    public async Task Admin_can_manage_the_full_fabric_lifecycle()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var anonymous = factory.CreateClient();

        var created = await admin.PostAsJsonAsync("/api/v1/admin/fabrics", TestHelpers.NewFabric("Lifecycle"), ct);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var id = (await created.JsonAsync()).GetProperty("id").GetString()!;
        Assert.StartsWith("fab-", id, StringComparison.Ordinal);
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync($"/api/v1/fabrics/{id}", ct)).StatusCode);

        var updated = await (await admin.PutAsJsonAsync($"/api/v1/admin/fabrics/{id}", TestHelpers.NewFabricWithSpecs("Renamed", 75m), ct)).JsonAsync();
        Assert.Equal(150m, updated.GetProperty("widthCm").GetDecimal());
        Assert.Equal("Autumn / Winter", updated.GetProperty("seasonLabel").GetProperty("en").GetString());
        Assert.Equal("Renamed", updated.GetProperty("nameEn").GetString());
        Assert.Equal(75m, updated.GetProperty("pricePerMeter").GetDecimal());

        await admin.PatchAsJsonAsync($"/api/v1/admin/fabrics/{id}/visibility", new { hidden = true }, ct);
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/v1/fabrics/{id}", ct)).StatusCode);
        var adminList = await (await admin.GetAsync("/api/v1/admin/fabrics?pageSize=100", ct)).JsonAsync();
        Assert.Contains(adminList.GetProperty("items").EnumerateArray(), f => f.GetProperty("id").GetString() == id && f.GetProperty("hidden").GetBoolean());

        Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/v1/admin/fabrics/{id}", ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync($"/api/v1/admin/fabrics/{id}", ct)).StatusCode);
    }

    [Fact]
    public async Task Fabric_validation_errors_are_reported_per_field()
    {
        var admin = await factory.CreateAdminClientAsync();
        var response = await admin.PostAsJsonAsync("/api/v1/admin/fabrics",
            new { pattern = "zigzag", category = "suit", pricePerMeter = -1, photos = new[] { new { src = "https://evil/x.jpg", alt = "" } } },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.JsonAsync()).GetProperty("errors");
        Assert.True(errors.TryGetProperty("pattern", out _));
        Assert.True(errors.TryGetProperty("pricePerMeter", out _));
        Assert.True(errors.TryGetProperty("photos[0].src", out _));
    }

    [Fact]
    public async Task Upload_rotates_upright_and_strips_location_metadata()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var original = await File.ReadAllBytesAsync(Path.Combine(AppContext.BaseDirectory, "Fixtures", "rotated-with-gps.jpg"), ct);

        var response = await admin.PostAsync("/api/v1/admin/uploads", Multipart(original, "IMG_0001.jpg", "image/jpeg"), ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var url = (await response.JsonAsync()).GetProperty("url").GetString()!;
        Assert.Matches("^/uploads/[0-9a-f]{32}\\.webp$", url);

        var served = await factory.CreateClient().GetAsync(url, ct);
        Assert.Equal(HttpStatusCode.OK, served.StatusCode);
        Assert.Equal("image/webp", served.Content.Headers.ContentType?.MediaType);
        var bytes = await served.Content.ReadAsByteArrayAsync(ct);

        using var bitmap = SKBitmap.Decode(bytes);
        // Stored 400x200 with "rotate 90° clockwise": upright it is 200x400, red on top, blue at the bottom.
        Assert.Equal(200, bitmap.Width);
        Assert.Equal(400, bitmap.Height);
        Assert.True(bitmap.GetPixel(100, 50).Red > 150 && bitmap.GetPixel(100, 50).Blue < 100, "top should be red");
        Assert.True(bitmap.GetPixel(100, 350).Blue > 150 && bitmap.GetPixel(100, 350).Red < 100, "bottom should be blue");

        // No EXIF block survives (it held the GPS position and the camera make).
        Assert.DoesNotContain("Exif", System.Text.Encoding.ASCII.GetString(bytes), StringComparison.Ordinal);
        Assert.DoesNotContain("TestPhoneMaker", System.Text.Encoding.ASCII.GetString(bytes), StringComparison.Ordinal);
    }

    [Fact]
    public async Task Upload_scales_large_photos_down_for_the_web()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var original = await File.ReadAllBytesAsync(Path.Combine(AppContext.BaseDirectory, "Fixtures", "large-4000x3000.jpg"), ct);

        var response = await admin.PostAsync("/api/v1/admin/uploads", Multipart(original, "big.jpg", "image/jpeg"), ct);
        var url = (await response.JsonAsync()).GetProperty("url").GetString()!;
        using var bitmap = SKBitmap.Decode(await factory.CreateClient().GetByteArrayAsync(url, ct));

        Assert.Equal(2000, bitmap.Width);
        Assert.Equal(1500, bitmap.Height);
    }

    [Fact]
    public async Task Upload_rejects_iphone_heic_with_guidance()
    {
        byte[] heic = [0, 0, 0, 0x18, (byte)'f', (byte)'t', (byte)'y', (byte)'p', (byte)'h', (byte)'e', (byte)'i', (byte)'c', 0, 0, 0, 0];
        var admin = await factory.CreateAdminClientAsync();
        var response = await admin.PostAsync("/api/v1/admin/uploads", Multipart(heic, "IMG_0002.HEIC", "image/heic"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        Assert.Contains("Most Compatible", (await response.JsonAsync()).GetProperty("detail").GetString(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task Upload_rejects_a_corrupt_image_that_only_looks_like_a_png()
    {
        byte[] fake = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3, 4];
        var admin = await factory.CreateAdminClientAsync();
        var response = await admin.PostAsync("/api/v1/admin/uploads", Multipart(fake, "x.png", "image/png"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    [Fact]
    public async Task Upload_rejects_files_that_are_not_images_regardless_of_declared_type()
    {
        var admin = await factory.CreateAdminClientAsync();
        var response = await admin.PostAsync("/api/v1/admin/uploads",
            Multipart("<svg onload=alert(1)>"u8.ToArray(), "x.png", "image/png"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ends_the_session()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/v1/auth/me", ct)).StatusCode);

        await admin.PostAsync("/api/v1/auth/logout", null, ct);

        Assert.Equal(HttpStatusCode.Unauthorized, (await admin.GetAsync("/api/v1/auth/me", ct)).StatusCode);
    }

    [Fact]
    public async Task Admin_can_list_orders_newest_first()
    {
        var ct = TestContext.Current.CancellationToken;
        var anonymous = factory.CreateClient();
        foreach (var name in new[] { "First", "Second" })
            (await anonymous.PostAsJsonAsync("/api/v1/orders", new { items = new[] { new { fabricId = "fab-001", meters = 1m } }, name, phone = "01112345678", governorate = "cairo", area = "Maadi", address = "x", paymentMethod = "cod" }, ct)).EnsureSuccessStatusCode();

        var admin = await factory.CreateAdminClientAsync();
        var body = await (await admin.GetAsync("/api/v1/admin/orders", ct)).JsonAsync();
        var names = body.GetProperty("items").EnumerateArray().Select(o => o.GetProperty("name").GetString()).ToList();

        Assert.True(names.IndexOf("Second") < names.IndexOf("First"));
        Assert.Equal("pending", body.GetProperty("items")[0].GetProperty("status").GetString());
        Assert.Equal("+201112345678", body.GetProperty("items")[0].GetProperty("phone").GetString());
        Assert.Equal("Cairo", body.GetProperty("items")[0].GetProperty("governorateLabel").GetProperty("en").GetString());
    }

    [Fact]
    public async Task Security_headers_are_present()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/fabrics", TestContext.Current.CancellationToken);
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
    }

    private static MultipartFormDataContent Multipart(byte[] bytes, string fileName, string contentType)
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return new MultipartFormDataContent { { file, "file", fileName } };
    }
}

public class RateLimitTests(StrictLoginLimitFactory factory) : IClassFixture<StrictLoginLimitFactory>
{
    [Fact]
    public async Task Login_is_rate_limited()
    {
        var client = factory.CreateClient();
        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 3; i++)
            statuses.Add((await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "x@y.z", password = "wrong-password" }, TestContext.Current.CancellationToken)).StatusCode);

        Assert.Equal([HttpStatusCode.Unauthorized, HttpStatusCode.Unauthorized, HttpStatusCode.TooManyRequests], statuses);
    }
}
