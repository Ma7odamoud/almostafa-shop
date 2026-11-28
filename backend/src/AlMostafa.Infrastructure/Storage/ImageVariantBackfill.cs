using System.Text.RegularExpressions;
using AlMostafa.Application.Media;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Infrastructure.Storage;

/// <summary>
/// Creates the responsive sizes for photos stored before sizes existed (or imported from the old site).
/// Runs once in the background after start-up. Purely additive: existing files are never modified or removed.
/// </summary>
internal sealed partial class ImageVariantBackfill(
    ResolvedUploadsPath uploads,
    IImageProcessor images,
    ILogger<ImageVariantBackfill> logger) : BackgroundService
{
    [GeneratedRegex(@"-\d+\.webp$", RegexOptions.IgnoreCase)]
    private static partial Regex VariantName();

    private static readonly string[] ImageExtensions = [".webp", ".jpg", ".jpeg", ".png"];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!Directory.Exists(uploads.Value)) return;

        var created = 0;
        foreach (var path in Directory.EnumerateFiles(uploads.Value))
        {
            if (stoppingToken.IsCancellationRequested) break;
            var name = Path.GetFileName(path);
            if (VariantName().IsMatch(name) || !ImageExtensions.Contains(Path.GetExtension(name).ToLowerInvariant()))
                continue;

            var missing = ImageVariants.Widths.Where(w => !File.Exists(Path.Combine(uploads.Value, ImageVariants.FileName(name, w)))).ToList();
            if (missing.Count == 0) continue;

            try
            {
                await using var source = File.OpenRead(path);
                var processed = await images.ProcessAsync(source, stoppingToken);
                foreach (var width in missing)
                {
                    var target = Path.Combine(uploads.Value, ImageVariants.FileName(name, width));
                    await File.WriteAllBytesAsync(target + ".tmp", processed.Variants[width], stoppingToken);
                    File.Move(target + ".tmp", target, overwrite: false);
                }
                created++;
            }
            catch (Exception ex) when (ex is InvalidImageException or IOException)
            {
                logger.LogWarning("Could not create sizes for {File}: {Reason}", name, ex.Message);
            }
        }

        if (created > 0)
            logger.LogInformation("Created responsive sizes for {Count} existing photos", created);
    }
}
