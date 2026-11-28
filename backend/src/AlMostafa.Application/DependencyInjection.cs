using AlMostafa.Application.Catalog;
using AlMostafa.Application.Identity;
using AlMostafa.Application.Media;
using AlMostafa.Application.Ordering;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AlMostafa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<CatalogService>(ServiceLifetime.Singleton);

        services.AddScoped<CatalogService>();
        services.AddScoped<FabricManagementService>();
        services.AddScoped<ICatalogPricing>(sp => sp.GetRequiredService<CatalogService>());
        services.AddScoped<OrderService>();
        services.AddScoped<AuthService>();
        services.AddScoped<MediaService>();
        return services;
    }
}
