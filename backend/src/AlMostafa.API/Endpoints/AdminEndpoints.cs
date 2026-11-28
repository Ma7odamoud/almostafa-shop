using AlMostafa.API.Common;
using AlMostafa.Application.Catalog;
using AlMostafa.Application.Common;
using AlMostafa.Application.Media;
using AlMostafa.Application.Ordering;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace AlMostafa.API.Endpoints;

internal static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder api)
    {
        var admin = api.MapGroup("/admin")
            .RequireAuthorization(ApiConventions.AdminPolicy)
            .AddEndpointFilter<AntiforgeryFilter>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        MapFabrics(admin.MapGroup("/fabrics").WithTags("Admin: Catalog"));
        MapOrders(admin.MapGroup("/orders").WithTags("Admin: Ordering"));
        MapUploads(admin.MapGroup("/uploads").WithTags("Admin: Media"));
        return api;
    }

    private static void MapFabrics(RouteGroupBuilder group)
    {
        group.MapGet("/", async Task<Ok<PagedResult<FabricDto>>> ([AsParameters] FabricListQuery query, FabricManagementService fabrics, CancellationToken ct) =>
                TypedResults.Ok(await fabrics.ListAsync(query.ToCriteria(), ct)))
            .WithName("AdminListFabrics")
            .WithSummary("List all fabrics, including hidden ones.");

        group.MapGet("/{id}", async Task<Ok<FabricDto>> (string id, FabricManagementService fabrics, CancellationToken ct) =>
                TypedResults.Ok(await fabrics.GetAsync(id, ct)))
            .WithName("AdminGetFabric")
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/", async Task<Created<FabricDto>> (UpsertFabricRequest request, FabricManagementService fabrics, CancellationToken ct) =>
            {
                var created = await fabrics.CreateAsync(request, ct);
                return TypedResults.Created($"/api/v1/admin/fabrics/{created.Id}", created);
            })
            .WithName("AdminCreateFabric")
            .ProducesValidationProblem();

        group.MapPut("/{id}", async Task<Ok<FabricDto>> (string id, UpsertFabricRequest request, FabricManagementService fabrics, CancellationToken ct) =>
                TypedResults.Ok(await fabrics.UpdateAsync(id, request, ct)))
            .WithName("AdminUpdateFabric")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPatch("/{id}/visibility", async Task<Ok<FabricDto>> (string id, SetFabricVisibilityRequest request, FabricManagementService fabrics, CancellationToken ct) =>
                TypedResults.Ok(await fabrics.SetVisibilityAsync(id, request.Hidden, ct)))
            .WithName("AdminSetFabricVisibility")
            .WithSummary("Show or hide a fabric from customers.")
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/{id}", async Task<NoContent> (string id, FabricManagementService fabrics, CancellationToken ct) =>
            {
                await fabrics.DeleteAsync(id, ct);
                return TypedResults.NoContent();
            })
            .WithName("AdminDeleteFabric")
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static void MapOrders(RouteGroupBuilder group)
    {
        group.MapGet("/", async Task<Ok<PagedResult<OrderDto>>> (OrderService orders, CancellationToken ct, [FromQuery(Name = "page")] int? page, [FromQuery(Name = "pageSize")] int? pageSize) =>
                TypedResults.Ok(await orders.ListAsync(page ?? 1, pageSize ?? Paging.DefaultPageSize, ct)))
            .WithName("AdminListOrders")
            .WithSummary("List orders, newest first.");
    }

    private static void MapUploads(RouteGroupBuilder group)
    {
        group.MapPost("/", async Task<Created<UploadResultDto>> (IFormFile file, MediaService media, CancellationToken ct) =>
            {
                await using var stream = file.OpenReadStream();
                var result = await media.UploadImageAsync(stream, file.Length, ct);
                return TypedResults.Created(result.Url, result);
            })
            .WithName("AdminUploadImage")
            .WithSummary("Upload a fabric photo (multipart field 'file'). Returns its public URL.")
            // CSRF is enforced by AntiforgeryFilter via the header, uniformly with the JSON endpoints.
            .DisableAntiforgery()
            .ProducesProblem(StatusCodes.Status413PayloadTooLarge)
            .ProducesProblem(StatusCodes.Status415UnsupportedMediaType);
    }
}
