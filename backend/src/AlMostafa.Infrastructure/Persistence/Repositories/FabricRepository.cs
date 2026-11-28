using AlMostafa.Application.Catalog;
using AlMostafa.Application.Common;
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
        var query = Filter(db.Fabrics.AsNoTracking(), c);
        var total = await query.CountAsync(cancellationToken);
        var items = await Sort(query, c.Sort).Skip((c.Page - 1) * c.PageSize).Take(c.PageSize).ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<(IReadOnlyList<FabricSummaryDto> Items, int TotalCount)> SearchSummariesAsync(
        FabricSearchCriteria c, CancellationToken cancellationToken)
    {
        var query = Filter(db.Fabrics.AsNoTracking(), c);
        var total = await query.CountAsync(cancellationToken);
        if (total == 0) return ([], 0);
        var rows = await ToSummaryRows(Sort(query, c.Sort).Skip((c.Page - 1) * c.PageSize).Take(c.PageSize)).ToListAsync(cancellationToken);
        return ([.. rows.Select(r => r.ToDto())], total);
    }

    public async Task<IReadOnlyList<FabricSummaryDto>> FindSimilarAsync(Fabric fabric, int limit, CancellationToken cancellationToken)
    {
        var (category, material, color, pattern) = (fabric.Category.Code, fabric.Material.Code, fabric.Color.Code, fabric.Pattern.Code);
        var query = db.Fabrics.AsNoTracking()
            .Where(f => !f.Hidden && f.Id != fabric.Id)
            // Only candidates sharing at least the garment category or the material are worth ranking.
            .Where(f => f.Category.Code == category || f.Material.Code == material)
            .OrderByDescending(f => f.Category.Code == category)
            .ThenByDescending(f => f.Material.Code == material)
            .ThenByDescending(f => f.Color.Code == color)
            .ThenByDescending(f => f.Pattern.Code == pattern)
            .ThenByDescending(f => f.CreatedAt)
            .Take(limit);
        var rows = await ToSummaryRows(query).ToListAsync(cancellationToken);
        return [.. rows.Select(r => r.ToDto())];
    }

    private static IQueryable<Fabric> Filter(IQueryable<Fabric> query, FabricSearchCriteria c)
    {

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
            // One ILIKE on the normalised search_text column, served by its trigram (GIN) index.
            var pattern = "%" + EscapeLike(search) + "%";
            query = query.Where(f => EF.Functions.ILike(f.SearchText, pattern, "\\"));
        }

        return query;
    }

    private static IQueryable<Fabric> Sort(IQueryable<Fabric> query, FabricSort sort) =>
        sort switch
        {
            FabricSort.Newest => query.OrderByDescending(f => f.CreatedAt).ThenBy(f => f.Id),
            FabricSort.Name => query.OrderBy(f => f.Name.En).ThenBy(f => f.Name.Ar).ThenBy(f => f.Id),
            FabricSort.PriceAsc => query.OrderBy(f => f.PricePerMeter).ThenBy(f => f.Id),
            FabricSort.PriceDesc => query.OrderByDescending(f => f.PricePerMeter).ThenBy(f => f.Id),
            _ => query.OrderBy(f => f.CreatedAt).ThenBy(f => f.Id),
        };

    /// <summary>SQL projection of only the columns a card needs (no descriptions, specifications or search text).</summary>
    private static IQueryable<SummaryRow> ToSummaryRows(IQueryable<Fabric> query) =>
        query.Select(f => new SummaryRow(
            f.Id, f.Name.Ar, f.Name.En, f.PricePerMeter, f.StockMeters,
            f.Color.Code, f.Color.Label.Ar, f.Color.Label.En,
            f.Material.Code, f.Material.Label.Ar, f.Material.Label.En,
            f.Pattern.Code, f.Pattern.Label.Ar, f.Pattern.Label.En,
            f.Category.Code, f.Category.Label.Ar, f.Category.Label.En,
            EF.Property<List<FabricPhoto>>(f, "_photos")));

    private sealed record SummaryRow(
        string Id, string NameAr, string NameEn, decimal PricePerMeter, decimal StockMeters,
        string Color, string ColorAr, string ColorEn, string Material, string MaterialAr, string MaterialEn,
        string Pattern, string PatternAr, string PatternEn, string Category, string CategoryAr, string CategoryEn,
        List<FabricPhoto> Photos)
    {
        // Cards show the first photo and the second on hover.
        public FabricSummaryDto ToDto() => new(
            Id, NameAr, NameEn, PricePerMeter, StockMeters,
            Color, new LocalizedTextDto(ColorAr, ColorEn), Material, new LocalizedTextDto(MaterialAr, MaterialEn),
            Pattern, new LocalizedTextDto(PatternAr, PatternEn), Category, new LocalizedTextDto(CategoryAr, CategoryEn),
            [.. Photos.Take(2).Select(p => new FabricPhotoDto(p.Src, p.Alt))]);
    }

    public async Task<FabricAttributeSets> GetVisibleAttributesAsync(CancellationToken cancellationToken)
    {
        var visible = db.Fabrics.AsNoTracking().Where(f => !f.Hidden);

        // GROUP BY in the database: one row per distinct value, ordered by first appearance in the catalogue
        // (the original storefront ordering). Never loads the fabrics themselves.
        var colors = await visible.GroupBy(f => f.Color.Code)
            .Select(g => new FacetRow(g.Key, g.Max(f => f.Color.Label.Ar)!, g.Max(f => f.Color.Label.En)!, g.Min(f => f.CreatedAt)))
            .ToListAsync(cancellationToken);
        var patterns = await visible.GroupBy(f => f.Pattern.Code)
            .Select(g => new FacetRow(g.Key, g.Max(f => f.Pattern.Label.Ar)!, g.Max(f => f.Pattern.Label.En)!, g.Min(f => f.CreatedAt)))
            .ToListAsync(cancellationToken);
        var materials = await visible.GroupBy(f => f.Material.Code)
            .Select(g => new FacetRow(g.Key, g.Max(f => f.Material.Label.Ar)!, g.Max(f => f.Material.Label.En)!, g.Min(f => f.CreatedAt)))
            .ToListAsync(cancellationToken);

        static FabricAttribute[] ToAttributes(List<FacetRow> rows) =>
            [.. rows.OrderBy(r => r.FirstSeen).ThenBy(r => r.Code, StringComparer.Ordinal)
                .Select(r => new FabricAttribute(r.Code, new LocalizedText(r.Ar, r.En)))];

        return new FabricAttributeSets(ToAttributes(colors), ToAttributes(patterns), ToAttributes(materials));
    }

    private sealed record FacetRow(string Code, string Ar, string En, DateTimeOffset FirstSeen);

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\", StringComparison.Ordinal)
             .Replace("%", "\\%", StringComparison.Ordinal)
             .Replace("_", "\\_", StringComparison.Ordinal);
}
