using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace AlMostafa.IntegrationTests;

internal static class TestHelpers
{
    public static HttpClient CreateCookieClient(this ApiFactory factory) =>
        factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true, AllowAutoRedirect = false });

    /// <summary>Signs in as the seeded admin and attaches the antiforgery header for later requests.</summary>
    public static async Task<HttpClient> CreateAdminClientAsync(this ApiFactory factory)
    {
        var client = factory.CreateCookieClient();
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        login.EnsureSuccessStatusCode();
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("X-XSRF-TOKEN", csrf.GetProperty("token").GetString());
        return client;
    }

    public static async Task<JsonElement> JsonAsync(this HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>();

    public static object NewFabric(string nameEn = "Integration Silk", decimal price = 50m, bool hidden = false) => new
    {
        nameAr = "حرير",
        nameEn,
        descriptionAr = "",
        descriptionEn = "Smooth",
        pricePerMeter = price,
        stockMeters = 0,
        color = "ivory",
        colorLabel = new { ar = "عاجي", en = "Ivory" },
        material = "silk",
        materialLabel = new { ar = "حرير", en = "Silk" },
        pattern = "plain",
        category = "suit",
        photos = new[] { new { src = "/uploads/x.jpg", alt = "x" } },
        hidden,
    };

    public static object NewFabricWithSpecs(string nameEn, decimal price) => new
    {
        nameAr = "حرير",
        nameEn,
        pricePerMeter = price,
        stockMeters = 0,
        color = "ivory",
        colorLabel = new { ar = "عاجي", en = "Ivory" },
        material = "silk",
        materialLabel = new { ar = "حرير", en = "Silk" },
        pattern = "plain",
        category = "suit",
        photos = Array.Empty<object>(),
        hidden = false,
        compositionEn = "100% Silk",
        widthCm = 150,
        weightGsm = 240,
        season = "autumn-winter",
        careEn = "Dry clean only",
    };
}
