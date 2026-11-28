using System.Reflection;
using AlMostafa.API.Common;
using AlMostafa.API.Endpoints;
using AlMostafa.Application;
using AlMostafa.Infrastructure;
using AlMostafa.Infrastructure.Persistence;
using AlMostafa.Infrastructure.Storage;
using Microsoft.Extensions.FileProviders;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// The build-time OpenAPI generator boots the app without a database; skip database work in that mode.
var isOpenApiGeneration = Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";
if (!isOpenApiGeneration && string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("Database")))
    throw new InvalidOperationException("ConnectionStrings:Database is not configured (env var ConnectionStrings__Database).");

builder.Host.UseSerilog((context, services, logger) => logger
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration, builder.Environment)
    .AddApi(builder.Configuration, builder.Environment);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseSerilogRequestLogging();
app.UseExceptionHandler();
app.UseStatusCodePages();

app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers.XContentTypeOptions = "nosniff";
    headers.XFrameOptions = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers.ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
    await next();
});

if (!app.Environment.IsDevelopment())
    app.UseHsts();

// Uploaded fabric photos, served at /uploads/* so URLs stored before the migration stay valid.
var uploadsRoot = app.Services.GetRequiredService<ResolvedUploadsPath>().Value;
Directory.CreateDirectory(uploadsRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = app.Configuration["Storage:PublicPath"] ?? "/uploads",
    OnPrepareResponse = ctx =>
    {
        // File names are random and never reused, so they can be cached forever.
        ctx.Context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        ctx.Context.Response.Headers.ContentSecurityPolicy = "default-src 'none'; sandbox";
    },
});

app.UseCors(ApiConventions.CorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs").AllowAnonymous();
}

app.MapHealthChecks("/health").DisableRateLimiting();

app.MapGroup("/api/v1")
    .MapCatalogEndpoints()
    .MapOrderEndpoints()
    .MapAuthEndpoints()
    .MapAdminEndpoints();

if (!isOpenApiGeneration)
    await app.InitializeDatabaseAsync();

await app.RunAsync();

public partial class Program;
