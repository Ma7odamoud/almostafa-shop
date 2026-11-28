using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;

namespace AlMostafa.IntegrationTests;

public class OrderApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Order_total_is_computed_from_catalogue_prices_not_client_values()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var fabric = await (await admin.PostAsJsonAsync("/api/v1/admin/fabrics", TestHelpers.NewFabric(price: 40m), ct)).JsonAsync();
        var id = fabric.GetProperty("id").GetString();

        var response = await factory.CreateClient().PostAsJsonAsync("/api/v1/orders", new
        {
            items = new[] { new { fabricId = id, meters = 2.5m, pricePerMeter = 0.01m, fabricNameEn = "fake" } },
            total = 0.01m,
            name = "Customer",
            address = "Cairo",
            paymentMethod = "cod",
        }, ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.JsonAsync();
        Assert.Equal(100m, body.GetProperty("total").GetDecimal());

        var orderId = body.GetProperty("orderId").GetString();
        var stored = await factory.WithDbAsync(db => db.Orders.SingleAsync(o => o.Id == orderId, ct));
        Assert.Equal("Integration Silk", stored.Items.Single().FabricName.En);
        Assert.Equal(40m, stored.Items.Single().PricePerMeter);
    }

    [Fact]
    public async Task Hidden_or_unknown_fabrics_cannot_be_ordered()
    {
        var ct = TestContext.Current.CancellationToken;
        var admin = await factory.CreateAdminClientAsync();
        var hidden = await (await admin.PostAsJsonAsync("/api/v1/admin/fabrics", TestHelpers.NewFabric(hidden: true), ct)).JsonAsync();

        var response = await factory.CreateClient().PostAsJsonAsync("/api/v1/orders", new
        {
            items = new[] { new { fabricId = hidden.GetProperty("id").GetString()!, meters = 1m }, new { fabricId = "nope", meters = 1m } },
            name = "A", address = "B", paymentMethod = "card",
        }, ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("fabric_unavailable", (await response.JsonAsync()).GetProperty("code").GetString());
    }

    [Fact]
    public async Task Invalid_order_returns_field_errors()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/api/v1/orders",
            new { items = new[] { new { fabricId = "fab-001", meters = 0.1m } }, name = "", address = "", paymentMethod = "barter" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.JsonAsync()).GetProperty("errors");
        Assert.True(errors.TryGetProperty("name", out _));
        Assert.True(errors.TryGetProperty("address", out _));
        Assert.True(errors.TryGetProperty("paymentMethod", out _));
        Assert.True(errors.TryGetProperty("items[0].meters", out _));
    }

    [Fact]
    public async Task Malformed_json_returns_400()
    {
        var response = await factory.CreateClient().PostAsync("/api/v1/orders",
            new StringContent("{not json", System.Text.Encoding.UTF8, "application/json"), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
