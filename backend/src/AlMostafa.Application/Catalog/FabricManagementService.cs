using System.Security.Cryptography;
using AlMostafa.Application.Common;
using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Common;
using FluentValidation;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Application.Catalog;

/// <summary>Admin catalogue management use cases.</summary>
public sealed class FabricManagementService(
    IFabricRepository fabrics,
    IUnitOfWork unitOfWork,
    ICatalogCache catalogCache,
    IValidator<UpsertFabricRequest> validator,
    TimeProvider clock,
    ILogger<FabricManagementService> logger)
{
    public async Task<PagedResult<FabricDto>> ListAsync(FabricSearchCriteria criteria, CancellationToken cancellationToken)
    {
        var normalized = CatalogService.Normalize(criteria) with { IncludeHidden = true };
        var (items, total) = await fabrics.SearchAsync(normalized, cancellationToken);
        return new PagedResult<FabricDto>([.. items.Select(FabricDto.From)], normalized.Page, normalized.PageSize, total);
    }

    public async Task<FabricDto> GetAsync(string id, CancellationToken cancellationToken) =>
        FabricDto.From(await LoadAsync(id, cancellationToken));

    public async Task<FabricDto> CreateAsync(UpsertFabricRequest request, CancellationToken cancellationToken)
    {
        await validator.EnsureValidAsync(request, cancellationToken);

        var id = await NewIdAsync(cancellationToken);
        var fabric = Fabric.Create(id, ToDetails(request), clock.GetUtcNow());
        fabrics.Add(fabric);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await catalogCache.InvalidateAsync(cancellationToken);

        logger.LogInformation("Fabric {FabricId} created", fabric.Id);
        return FabricDto.From(fabric);
    }

    public async Task<FabricDto> UpdateAsync(string id, UpsertFabricRequest request, CancellationToken cancellationToken)
    {
        await validator.EnsureValidAsync(request, cancellationToken);

        var fabric = await LoadAsync(id, cancellationToken);
        fabric.Update(ToDetails(request), clock.GetUtcNow());
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await catalogCache.InvalidateAsync(cancellationToken);

        logger.LogInformation("Fabric {FabricId} updated", fabric.Id);
        return FabricDto.From(fabric);
    }

    public async Task<FabricDto> SetVisibilityAsync(string id, bool hidden, CancellationToken cancellationToken)
    {
        var fabric = await LoadAsync(id, cancellationToken);
        fabric.SetVisibility(hidden, clock.GetUtcNow());
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await catalogCache.InvalidateAsync(cancellationToken);

        logger.LogInformation("Fabric {FabricId} visibility set to hidden={Hidden}", fabric.Id, hidden);
        return FabricDto.From(fabric);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken)
    {
        var fabric = await LoadAsync(id, cancellationToken);
        fabrics.Remove(fabric);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await catalogCache.InvalidateAsync(cancellationToken);

        // Orders keep their own name/price snapshot, so past orders are unaffected.
        logger.LogInformation("Fabric {FabricId} deleted", id);
    }

    private async Task<Fabric> LoadAsync(string id, CancellationToken cancellationToken) =>
        await fabrics.FindAsync(id, cancellationToken) ?? throw new NotFoundException("Fabric", id);

    private async Task<string> NewIdAsync(CancellationToken cancellationToken)
    {
        // Same "fab-" prefix as existing ids; random suffix avoids the timestamp collisions of the old scheme.
        while (true)
        {
            var id = "fab-" + Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(6));
            if (!await fabrics.ExistsAsync(id, cancellationToken))
                return id;
        }
    }

    private static FabricDetails ToDetails(UpsertFabricRequest r) => new(
        new LocalizedText(r.NameAr, r.NameEn),
        new LocalizedText(r.DescriptionAr, r.DescriptionEn),
        r.PricePerMeter,
        r.StockMeters,
        new FabricAttribute(r.Color, (r.ColorLabel ?? new LocalizedTextDto("", "")).ToDomain()),
        new FabricAttribute(r.Material, (r.MaterialLabel ?? new LocalizedTextDto("", "")).ToDomain()),
        r.Pattern ?? string.Empty,
        r.Category ?? string.Empty,
        [.. (r.Photos ?? []).Select(p => new FabricPhoto(p.Src, p.Alt))],
        r.Hidden,
        new FabricSpecifications(
            new LocalizedText(r.CompositionAr, r.CompositionEn),
            r.WidthCm,
            r.WeightGsm,
            r.Season,
            new LocalizedText(r.CareAr, r.CareEn)));
}
