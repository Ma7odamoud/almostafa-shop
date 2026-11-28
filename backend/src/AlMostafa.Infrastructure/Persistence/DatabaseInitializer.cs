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
            var pending = (await db.Database.GetPendingMigrationsAsync(cancellationToken)).ToList();
            if (pending.Count > 0)
            {
                logger.LogInformation("Applying {Count} pending migrations: {Migrations}", pending.Count, string.Join(", ", pending));
                await db.Database.MigrateAsync(cancellationToken);
            }
        }

        await services.GetRequiredService<AdminSeeder>().SeedAsync();

        var contentRoot = services.GetRequiredService<IHostEnvironment>().ContentRootPath;
        await services.GetRequiredService<LegacyDataImporter>().ImportAsync(contentRoot, cancellationToken);
    }
}
