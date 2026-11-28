using System.Net;

namespace AlMostafa.IntegrationTests;

public class CatalogApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Legacy_fabrics_are_imported_in_original_order_with_original_ids()
    {
        var body = await (await factory.CreateClient().GetAsync("/api/v1/fabrics?pageSize=100", TestContext.Current.CancellationToken)).JsonAsync();

        var ids = body.GetProperty("items").EnumerateArray().Select(f => f.GetProperty("id").GetString()).ToList();
        Assert.Equal(["fab-001", "fab-002", "fab-003", "fab-004", "fab-005", "fab-006"], ids.Where(i => i!.StartsWith("fab-00", StringComparison.Ordinal)));
        Assert.Equal("Navy Merino Wool", body.GetProperty("items")[0].GetProperty("nameEn").GetString());
    }

    [Theory]
    [InlineData("?categories=jacket", new[] { "fab-002", "fab-006" })]
    [InlineData("?patterns=stripes", new[] { "fab-005" })]
    [InlineData("?materials=linen&categories=trousers", new[] { "fab-003" })]
    [InlineData("?search=CASHMERE", new[] { "fab-004" })]
    [InlineData("?search=%D9%83%D8%AA%D8%A7%D9%86", new[] { "fab-003", "fab-005" })] // "كتان"
    [InlineData("?search=100%25", new string[0])] // LIKE wildcards are escaped
    public async Task Fabrics_can_be_filtered_and_searched(string query, string[] expected)
    {
        var body = await (await factory.CreateClient().GetAsync("/api/v1/fabrics" + query, TestContext.Current.CancellationToken)).JsonAsync();
        var ids = body.GetProperty("items").EnumerateArray().Select(f => f.GetProperty("id").GetString()).Where(i => i!.StartsWith("fab-00", StringComparison.Ordinal));
        Assert.Equal(expected, ids);
    }

    [Fact]
    public async Task Fabrics_are_paginated()
    {
        var body = await (await factory.CreateClient().GetAsync("/api/v1/fabrics?page=2&pageSize=4", TestContext.Current.CancellationToken)).JsonAsync();

        Assert.Equal(2, body.GetProperty("page").GetInt32());
        Assert.Equal(4, body.GetProperty("pageSize").GetInt32());
        Assert.True(body.GetProperty("totalCount").GetInt32() >= 6);
        Assert.True(body.GetProperty("totalPages").GetInt32() >= 2);
    }

    [Fact]
    public async Task Invalid_sort_returns_validation_problem()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/fabrics?sort=random", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("validation_failed", (await response.JsonAsync()).GetProperty("code").GetString());
    }

    [Fact]
    public async Task Facets_list_distinct_attributes()
    {
        var body = await (await factory.CreateClient().GetAsync("/api/v1/fabrics/facets", TestContext.Current.CancellationToken)).JsonAsync();
        var materials = body.GetProperty("materials").EnumerateArray().Select(m => m.GetProperty("value").GetString()).ToList();

        Assert.Contains("wool", materials);
        Assert.Equal(materials.Count, materials.Distinct().Count());
        Assert.Equal(4, body.GetProperty("categories").GetArrayLength());
    }

    [Fact]
    public async Task Unknown_fabric_returns_problem_details_404()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/fabrics/does-not-exist", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("not_found", (await response.JsonAsync()).GetProperty("code").GetString());
    }
}
