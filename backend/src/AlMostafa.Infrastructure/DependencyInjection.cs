using AlMostafa.Application.Catalog;
using AlMostafa.Application.Common;
using AlMostafa.Application.Identity;
using AlMostafa.Application.Media;
using AlMostafa.Application.Ordering;
using AlMostafa.Infrastructure.Identity;
using AlMostafa.Infrastructure.Persistence;
using AlMostafa.Infrastructure.Persistence.Repositories;
using AlMostafa.Infrastructure.Seeding;
using AlMostafa.Infrastructure.Storage;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace AlMostafa.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("Database") ?? string.Empty;

        services.AddDbContext<AppDbContext>(options => options
            .UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure(3))
            .UseSnakeCaseNamingConvention());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<IFabricRepository, FabricRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        services.AddIdentityCore<IdentityUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                // Length is what matters most; composition rules are relaxed (NIST SP 800-63B).
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();
        var dataProtection = services.AddDataProtection().SetApplicationName("AlMostafa");
        // Keys live in the database so sessions survive restarts and work across instances.
        // (Skipped only when no database is configured, e.g. build-time OpenAPI generation.)
        if (!string.IsNullOrWhiteSpace(connectionString))
            dataProtection.PersistKeysToDbContext<AppDbContext>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<AdminSeeder>();

        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.AddSingleton(sp => new ResolvedUploadsPath(
            Path.GetFullPath(sp.GetRequiredService<IOptions<StorageOptions>>().Value.UploadsPath, environment.ContentRootPath)));
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        services.AddSingleton<IImageProcessor, SkiaImageProcessor>();

        services.Configure<LegacyImportOptions>(configuration.GetSection(LegacyImportOptions.SectionName));
        services.AddScoped<LegacyDataImporter>();

        services.AddSingleton(TimeProvider.System);
        return services;
    }
}
