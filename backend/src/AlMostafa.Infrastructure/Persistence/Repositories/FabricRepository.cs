using AlMostafa.Application.Catalog;
using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace AlMostafa.Infrastructure.Persistence.Repositories;

internal sealed class FabricRepository(AppDbContext db) : IFabricRepository
{
    public Task<Fabric?> FindAsync(string id, CancellationToken cancellationToken) =>
        db.Fabrics.FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Fabric>> FindManyAsync(IReadOnlyCollection<string> ids, CancellationToken cancellationToken) =>
        await db.Fabrics.Where(f => ids.Contains(f.Id)).ToListAsync(cancellationToken);

    public Task<bool> ExistsAsync(string id, CancellationToken cancellationToken) =>
        db.Fabrics.AnyAsync(f => f.Id == id, cancellationToken);

    public void Add(Fabric fabric) => db.Fabrics.Add(fabric);

    public void Remove(Fabric fabric) => db.Fabrics.Remove(fabric);

    public async Task<(IReadOnlyList<Fabric> Items, int TotalCount)> SearchAsync(
        FabricSearchCriteria c, CancellationToken cancellationToken)
    {
        var query = db.Fabrics.AsNoTracking();

        if (!c.IncludeHidden)
            query = query.Where(f => !f.Hidden);
        if (c.Colors.Count > 0)
            query = query.Where(f => c.Colors.Contains(f.Color.Code));
        if (c.Patterns.Count > 0)
            query = query.Where(f => c.Patterns.Contains(f.Pattern.Code));
        if (c.Materials.Count > 0)
            query = query.Where(f => c.Materials.Contains(f.Material.Code));
        if (c.Categories.Count > 0)
            query = query.Where(f => c.Categories.Contains(f.Category.Code));

        if (c.Search is { Length: > 0 } search)
        {
            // Case-insensitive substring match over the same bilingual fields the storefront searched before.
            var pattern = "%" + EscapeLike(search) + "%";
            query = query.Where(f =>
                EF.Functions.ILike(f.Name.Ar, pattern, "\\") ||
                EF.Functions.ILike(f.Name.En, pattern, "\\") ||
                EF.Functions.ILike(f.Description.Ar, pattern, "\\") ||
                EF.Functions.ILike(f.Description.En, pattern, "\\") ||
                EF.Functions.ILike(f.Color.Label.Ar, pattern, "\\") ||
                EF.Functions.ILike(f.Color.Label.En, pattern, "\\") ||
                EF.Functions.ILike(f.Material.Label.Ar, pattern, "\\") ||
                EF.Functions.ILike(f.Material.Label.En, pattern, "\\") ||
                EF.Functions.ILike(f.Pattern.Label.Ar, pattern, "\\") ||
                EF.Functions.ILike(f.Pattern.Label.En, pattern, "\\") ||
                EF.Functions.ILike(f.Category.Label.Ar, pattern, "\\") ||
                EF.Functions.ILike(f.Category.Label.En, pattern, "\\"));
        }

        var total = await query.CountAsync(cancellationToken);

        query = c.Sort switch
        {
            FabricSort.Newest => query.OrderByDescending(f => f.CreatedAt).ThenBy(f => f.Id),
            FabricSort.Name => query.OrderBy(f => f.Name.En).ThenBy(f => f.Name.Ar).ThenBy(f => f.Id),
            FabricSort.PriceAsc => query.OrderBy(f => f.PricePerMeter).ThenBy(f => f.Id),
            FabricSort.PriceDesc => query.OrderByDescending(f => f.PricePerMeter).ThenBy(f => f.Id),
            _ => query.OrderBy(f => f.CreatedAt).ThenBy(f => f.Id),
        };

        var items = await query
            .Skip((c.Page - 1) * c.PageSize)
            .Take(c.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<FabricAttributeSets> GetVisibleAttributesAsync(CancellationToken cancellationToken)
    {
        var rows = await db.Fabrics.AsNoTracking()
            .Where(f => !f.Hidden)
            .OrderBy(f => f.CreatedAt).ThenBy(f => f.Id)
            .Select(f => new
            {
                Color = f.Color.Code, ColorAr = f.Color.Label.Ar, ColorEn = f.Color.Label.En,
                Pattern = f.Pattern.Code, PatternAr = f.Pattern.Label.Ar, PatternEn = f.Pattern.Label.En,
                Material = f.Material.Code, MaterialAr = f.Material.Label.Ar, MaterialEn = f.Material.Label.En,
            })
            .ToListAsync(cancellationToken);

        // First occurrence wins, in catalogue order (same behaviour as the original client-side facet builder).
        static FabricAttribute[] Distinct(IEnumerable<(string Code, string Ar, string En)> values) =>
            [.. values.DistinctBy(v => v.Code).Select(v => new FabricAttribute(v.Code, new LocalizedText(v.Ar, v.En)))];

        return new FabricAttributeSets(
            Distinct(rows.Select(r => (r.Color, r.ColorAr, r.ColorEn))),
            Distinct(rows.Select(r => (r.Pattern, r.PatternAr, r.PatternEn))),
            Distinct(rows.Select(r => (r.Material, r.MaterialAr, r.MaterialEn))));
    }

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\", StringComparison.Ordinal)
             .Replace("%", "\\%", StringComparison.Ordinal)
             .Replace("_", "\\_", StringComparison.Ordinal);
}
