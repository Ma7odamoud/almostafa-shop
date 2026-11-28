using AlMostafa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace AlMostafa.IntegrationTests;

/// <summary>
/// Boots the real API against a throw-away PostgreSQL database (migrated + legacy-imported on startup).
/// DbServer: env var <c>TEST_DATABASE</c> (an Npgsql connection string without Database), default localhost/postgres.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "integration-test-pw";

    private readonly string _database = "almostafa_test_" + Guid.NewGuid().ToString("N")[..12];
    private readonly string _uploads = Path.Combine(Path.GetTempPath(), "almostafa-uploads-" + Guid.NewGuid().ToString("N"));

    private static string DbServer =>
        Environment.GetEnvironmentVariable("TEST_DATABASE") ?? "Host=localhost;Port=5432;Username=postgres;Password=postgres";

    public string ConnectionString => new NpgsqlConnectionStringBuilder(DbServer) { Database = _database }.ConnectionString;

    protected virtual int LoginPerMinute => 1000;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var legacy = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../data/legacy"));
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Database", ConnectionString);
        builder.UseSetting("Database:MigrateOnStartup", "true");
        builder.UseSetting("Admin:Email", AdminEmail);
        builder.UseSetting("Admin:Password", AdminPassword);
        builder.UseSetting("LegacyImport:DataPath", legacy);
        builder.UseSetting("Storage:UploadsPath", _uploads);
        builder.UseSetting("Auth:SecureCookies", "false");
        builder.UseSetting("RateLimiting:GlobalPerMinute", "100000");
        builder.UseSetting("RateLimiting:OrdersPerMinute", "100000");
        builder.UseSetting("RateLimiting:LoginPerMinute", LoginPerMinute.ToString(System.Globalization.CultureInfo.InvariantCulture));
        builder.UseSetting("Serilog:MinimumLevel:Default", "Warning");
    }

    public async Task<T> WithDbAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        await using var scope = Services.CreateAsyncScope();
        return await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }

    public ValueTask InitializeAsync()
    {
        _ = DbServer; // Database is created by the API's migration on first client creation.
        return ValueTask.CompletedTask;
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        NpgsqlConnection.ClearAllPools();
        await using var conn = new NpgsqlConnection(DbServer);
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{_database}\" WITH (FORCE)", conn);
        await cmd.ExecuteNonQueryAsync();
        if (Directory.Exists(_uploads)) Directory.Delete(_uploads, recursive: true);
        GC.SuppressFinalize(this);
    }
}

public sealed class StrictLoginLimitFactory : ApiFactory
{
    protected override int LoginPerMinute => 2;
}
