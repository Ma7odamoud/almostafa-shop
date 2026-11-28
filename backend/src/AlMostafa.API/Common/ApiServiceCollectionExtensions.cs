using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using AlMostafa.Application.Identity;
using AlMostafa.Application.Media;
using AlMostafa.Infrastructure.Persistence;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi;

namespace AlMostafa.API.Common;

internal static class ApiServiceCollectionExtensions
{
    public static IServiceCollection AddApi(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        services.ConfigureHttpJsonOptions(o =>
        {
            // Strict numbers keep the contract (and the generated TypeScript types) as plain `number`.
            o.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
            o.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        });

        services.AddProblemDetails(o => o.CustomizeProblemDetails = ctx =>
        {
            ctx.ProblemDetails.Instance ??= $"{ctx.HttpContext.Request.Method} {ctx.HttpContext.Request.Path}";
            ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier;
            ctx.ProblemDetails.Extensions.TryAdd("code", ctx.ProblemDetails.Status switch
            {
                StatusCodes.Status401Unauthorized => "unauthorized",
                StatusCodes.Status403Forbidden => "forbidden",
                StatusCodes.Status404NotFound => "not_found",
                StatusCodes.Status429TooManyRequests => "rate_limited",
                _ => "error",
            });
        });
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddAuthenticationAndAuthorization(configuration, environment);
        services.AddRateLimiting(configuration);
        services.AddCorsPolicy(configuration);

        // Uploads: cap multipart bodies a little above the media limit; MediaService enforces the exact limit.
        var maxUpload = configuration.GetValue($"{MediaOptions.SectionName}:{nameof(MediaOptions.MaxUploadBytes)}", 20L * 1024 * 1024);
        services.Configure<MediaOptions>(configuration.GetSection(MediaOptions.SectionName));
        services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = maxUpload + 64 * 1024);

        services.Configure<ForwardedHeadersOptions>(o =>
        {
            o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            // Only trust X-Forwarded-* from known proxies (the Next.js server / load balancer). Loopback is trusted by default.
            foreach (var proxy in configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>() ?? [])
                o.KnownProxies.Add(IPAddress.Parse(proxy));
            foreach (var network in configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() ?? [])
                o.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
        });

        services.AddHealthChecks().AddDbContextCheck<AppDbContext>("database");

        services.AddOpenApi("v1", o => o.AddDocumentTransformer((document, _, _) =>
        {
            document.Info = new OpenApiInfo
            {
                Title = "Al-Mostafa API",
                Version = "v1",
                Description = "Backend for the Al-Mostafa fabric store. Errors are RFC 9457 Problem Details with a stable `code`. " +
                              "Admin endpoints require the session cookie and, for state-changing requests, the X-XSRF-TOKEN header.",
            };
            return Task.CompletedTask;
        }));

        return services;
    }

    private static void AddAuthenticationAndAuthorization(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var secureCookies = configuration.GetValue("Auth:SecureCookies", !environment.IsDevelopment());
        var securePolicy = secureCookies ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;

        services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddIdentityCookies(cookies => cookies.ApplicationCookie?.Configure(o =>
            {
                o.Cookie.Name = configuration["Auth:CookieName"] ?? "almostafa_session";
                o.Cookie.HttpOnly = true;
                o.Cookie.SameSite = SameSiteMode.Strict;
                o.Cookie.SecurePolicy = securePolicy;
                // Same 12-hour session lifetime as the original JWT cookie.
                o.ExpireTimeSpan = TimeSpan.FromHours(12);
                o.SlidingExpiration = false;
                // This is an API: answer with status codes instead of redirecting to a login page.
                o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
                o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
            }));

        services.AddAuthorizationBuilder()
            .AddPolicy(ApiConventions.AdminPolicy, p => p.RequireAuthenticatedUser().RequireRole(Roles.Admin));

        services.AddAntiforgery(o =>
        {
            o.HeaderName = ApiConventions.AntiforgeryHeader;
            o.Cookie.Name = "almostafa_af";
            o.Cookie.HttpOnly = true;
            o.Cookie.SameSite = SameSiteMode.Strict;
            o.Cookie.SecurePolicy = securePolicy;
        });
    }

    private static void AddRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var permitPerMinute = configuration.GetValue("RateLimiting:GlobalPerMinute", 300);
        var loginPerMinute = configuration.GetValue("RateLimiting:LoginPerMinute", 5);
        var ordersPerMinute = configuration.GetValue("RateLimiting:OrdersPerMinute", 10);

        services.AddRateLimiter(o =>
        {
            o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            o.OnRejected = async (ctx, ct) =>
            {
                if (ctx.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    ctx.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString(System.Globalization.CultureInfo.InvariantCulture);
                await TypedResults.Problem(new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too many requests",
                    Detail = "Please wait a moment and try again.",
                    Extensions = { ["code"] = "rate_limited" },
                }).ExecuteAsync(ctx.HttpContext);
            };

            o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(http =>
                RateLimitPartition.GetFixedWindowLimiter(ClientKey(http), _ => Window(permitPerMinute)));
            o.AddPolicy(ApiConventions.LoginRateLimit, http =>
                RateLimitPartition.GetFixedWindowLimiter(ClientKey(http), _ => Window(loginPerMinute)));
            o.AddPolicy(ApiConventions.OrdersRateLimit, http =>
                RateLimitPartition.GetFixedWindowLimiter(ClientKey(http), _ => Window(ordersPerMinute)));
        });

        static string ClientKey(HttpContext http) => http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        static FixedWindowRateLimiterOptions Window(int permits) =>
            new() { PermitLimit = permits, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 };
    }

    private static void AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        // The storefront normally calls the API same-origin through the Next.js rewrite, so CORS is only
        // needed when a browser calls the API host directly. Only explicitly listed origins are allowed.
        var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        services.AddCors(o => o.AddPolicy(ApiConventions.CorsPolicy, p => p
            .WithOrigins(origins)
            .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
            .WithHeaders("Content-Type", ApiConventions.AntiforgeryHeader)
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromHours(1))));
    }
}
