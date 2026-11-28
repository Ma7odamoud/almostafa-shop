using System.Globalization;
using System.Text.Json;
using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Common;
using AlMostafa.Domain.Ordering;
using AlMostafa.Infrastructure.Persistence;
using AlMostafa.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AlMostafa.Infrastructure.Seeding;

public sealed class LegacyImportOptions
{
    public const string SectionName = "LegacyImport";

    /// <summary>Directory holding the old <c>fabrics.json</c> / <c>orders.json</c>. Empty disables the import.</summary>
    public string? DataPath { get; set; }

    /// <summary>Optional: the old <c>public/uploads</c> directory, whose files are copied into the new uploads store.</summary>
    public string? UploadsPath { get; set; }
}

/// <summary>
/// One-way, non-destructive import of the original JSON file store into the database.
/// <list type="bullet">
///   <item>Fabrics are imported only while the fabrics table is empty (first boot), preserving ids and file order.</item>
///   <item>Orders are imported by id; orders already in the database are left untouched.</item>
///   <item>Uploaded photos are copied, never moved or overwritten, so <c>/uploads/...</c> URLs keep working.</item>
///   <item>The source files are only read.</item>
/// </list>
/// </summary>
internal sealed class LegacyDataImporter(
    AppDbContext db,
    IOptions<LegacyImportOptions> options,
    ResolvedUploadsPath uploads,
    TimeProvider clock,
    ILogger<LegacyDataImporter> logger)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task ImportAsync(string contentRoot, CancellationToken cancellationToken)
    {
        var dataPath = Resolve(contentRoot, options.Value.DataPath);
        if (dataPath is not null)
        {
            await ImportFabricsAsync(Path.Combine(dataPath, "fabrics.json"), cancellationToken);
            await ImportOrdersAsync(Path.Combine(dataPath, "orders.json"), cancellationToken);
        }

        var uploadsPath = Resolve(contentRoot, options.Value.UploadsPath);
        if (uploadsPath is not null)
            CopyUploads(uploadsPath);
    }

    private async Task ImportFabricsAsync(string file, CancellationToken cancellationToken)
    {
        if (!File.Exists(file)) return;
        if (await db.Fabrics.AnyAsync(cancellationToken))
        {
            logger.LogDebug("Fabrics already present; skipping legacy fabric import");
            return;
        }

        var legacy = JsonSerializer.Deserialize<List<LegacyFabric>>(await File.ReadAllTextAsync(file, cancellationToken), Json) ?? [];
        // Spread CreatedAt by one second per item so "catalogue order" matches the original file order.
        var baseTime = clock.GetUtcNow().AddSeconds(-legacy.Count);
        var imported = 0;
        for (var i = 0; i < legacy.Count; i++)
        {
            var f = legacy[i];
            try
            {
                var details = new FabricDetails(
                    new LocalizedText(f.NameAr, f.NameEn),
                    new LocalizedText(f.DescriptionAr, f.DescriptionEn),
                    f.PricePerMeter,
                    f.StockMeters,
                    new FabricAttribute(f.Color, Label(f.ColorLabel)),
                    new FabricAttribute(f.Material, Label(f.MaterialLabel)),
                    f.Pattern ?? "other",
                    f.Category ?? string.Empty,
                    [.. (f.Photos ?? []).Select(p => new FabricPhoto(p.Src ?? string.Empty, p.Alt))],
                    f.Hidden);
                db.Fabrics.Add(Fabric.Create(f.Id ?? string.Empty, details, baseTime.AddSeconds(i)));
                imported++;
            }
            catch (DomainException ex)
            {
                logger.LogWarning("Skipped legacy fabric {FabricId}: {Reason}", f.Id, ex.Message);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Imported {Count} of {Total} legacy fabrics from {File}", imported, legacy.Count, file);
    }

    private async Task ImportOrdersAsync(string file, CancellationToken cancellationToken)
    {
        if (!File.Exists(file)) return;

        var legacy = JsonSerializer.Deserialize<List<LegacyOrder>>(await File.ReadAllTextAsync(file, cancellationToken), Json) ?? [];
        var ids = legacy.Where(o => o.Id is not null).Select(o => o.Id!).ToList();
        var existing = (await db.Orders.Where(o => ids.Contains(o.Id)).Select(o => o.Id).ToListAsync(cancellationToken)).ToHashSet();

        var imported = 0;
        foreach (var o in legacy.Where(o => o.Id is not null && !existing.Contains(o.Id)))
        {
            try
            {
                var lines = (o.Items ?? []).Select(i => new OrderLine(
                    i.FabricId ?? string.Empty,
                    new LocalizedText(i.FabricNameAr ?? i.FabricName, i.FabricNameEn ?? i.FabricName),
                    i.Meters,
                    i.PricePerMeter));
                var createdAt = DateTimeOffset.TryParse(o.CreatedAt, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var d)
                    ? d.ToUniversalTime()
                    : clock.GetUtcNow();
                db.Orders.Add(Order.Import(o.Id!, o.Name ?? string.Empty, o.Address ?? string.Empty, o.PaymentMethod ?? string.Empty, o.Total, createdAt, lines));
                imported++;
            }
            catch (DomainException ex)
            {
                logger.LogWarning("Skipped legacy order {OrderId}: {Reason}", o.Id, ex.Message);
            }
        }

        if (imported > 0)
        {
            await db.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Imported {Count} legacy orders from {File}", imported, file);
        }
    }

    private void CopyUploads(string source)
    {
        if (!Directory.Exists(source)) return;
        Directory.CreateDirectory(uploads.Value);
        var copied = 0;
        foreach (var path in Directory.EnumerateFiles(source))
        {
            var target = Path.Combine(uploads.Value, Path.GetFileName(path));
            if (File.Exists(target)) continue;
            File.Copy(path, target, overwrite: false);
            copied++;
        }
        if (copied > 0)
            logger.LogInformation("Copied {Count} legacy uploaded files into {Target}", copied, uploads.Value);
    }

    private static LocalizedText Label(LegacyLabel? label) => new(label?.Ar, label?.En);

    private static string? Resolve(string contentRoot, string? path) =>
        string.IsNullOrWhiteSpace(path) ? null : Path.GetFullPath(path, contentRoot);

    private sealed record LegacyLabel(string? Ar, string? En);

    private sealed record LegacyPhoto(string? Src, string? Alt);

    private sealed record LegacyFabric(
        string? Id, string? NameAr, string? NameEn, string? DescriptionAr, string? DescriptionEn,
        decimal PricePerMeter, decimal StockMeters,
        string? Color, LegacyLabel? ColorLabel, string? Material, LegacyLabel? MaterialLabel,
        string? Pattern, string? Category, List<LegacyPhoto>? Photos, bool Hidden);

    private sealed record LegacyOrderItem(
        string? FabricId, string? FabricName, string? FabricNameAr, string? FabricNameEn, decimal Meters, decimal PricePerMeter);

    private sealed record LegacyOrder(
        string? Id, List<LegacyOrderItem>? Items, decimal Total, string? Name, string? Address,
        string? PaymentMethod, string? CreatedAt);
}
