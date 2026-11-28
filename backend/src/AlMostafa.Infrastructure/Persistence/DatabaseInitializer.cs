using AlMostafa.Infrastructure.Identity;
using AlMostafa.Infrastructure.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    /// <summary>Fills the search column for fabrics stored before it existed. Idempotent; only touches rows where it is empty.</summary>
    private static async Task BackfillSearchTextAsync(AppDbContext db, ILogger logger, CancellationToken cancellationToken)
    {
        var total = 0;
        while (true)
        {
            var batch = await db.Fabrics.Where(f => f.SearchText == "").OrderBy(f => f.Id).Take(500).ToListAsync(cancellationToken);
            foreach (var fabric in batch) fabric.RefreshSearchText();
            await db.SaveChangesAsync(cancellationToken);
            total += batch.Count;
            db.ChangeTracker.Clear();
            if (batch.Count < 500) break;
        }
        if (total > 0) logger.LogInformation("Built search text for {Count} fabrics", total);
    }

    /// <summary>
    /// Applies pending migrations (only when <c>Database:MigrateOnStartup</c> is true), bootstraps the admin
    /// account and runs the one-time legacy import. Nothing here drops, truncates or overwrites existing data.
    /// </summary>
    public static async Task InitializeDatabaseAsync(this IHost host, CancellationToken cancellationToken = default)
    {
        await using var scope = host.Services.CreateAsyncScope();
        var services = scope.ServiceProvider;
        var configuration = services.GetRequiredService<IConfiguration>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(DatabaseInitializer));
        var db = services.GetRequiredService<AppDbContext>();

        if (configuration.GetValue("Database:MigrateOnStartup", false))
        {
            // MigrateAsync creates the history table when missing, so a first start logs no spurious errors.
            await db.Database.MigrateAsync(cancellationToken);
            var applied = await db.Database.GetAppliedMigrationsAsync(cancellationToken);
            logger.LogInformation("Database schema is up to date ({Count} migrations applied)", applied.Count());
        }

        await BackfillSearchTextAsync(db, logger, cancellationToken);

        await services.GetRequiredService<AdminSeeder>().SeedAsync();

        var contentRoot = services.GetRequiredService<IHostEnvironment>().ContentRootPath;
        await services.GetRequiredService<LegacyDataImporter>().ImportAsync(contentRoot, cancellationToken);
    }
}
