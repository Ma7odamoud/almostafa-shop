using System.Security.Claims;
using AlMostafa.API.Common;
using AlMostafa.Application.Identity;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;

namespace AlMostafa.API.Endpoints;

internal sealed record CsrfTokenDto(string Token, string HeaderName);

internal static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/auth").WithTags("Authentication");

        group.MapPost("/login", async Task<NoContent> (LoginRequest request, AuthService auth, CancellationToken ct) =>
            {
                await auth.LoginAsync(request, ct);
                return TypedResults.NoContent();
            })
            .WithName("Login")
            .WithSummary("Sign in. On success the HttpOnly session cookie is set.")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .RequireRateLimiting(ApiConventions.LoginRateLimit);

        group.MapPost("/logout", async Task<NoContent> (AuthService auth) =>
            {
                await auth.LogoutAsync();
                return TypedResults.NoContent();
            })
            .WithName("Logout")
            .WithSummary("Sign out and clear the session cookie.");

        group.MapGet("/me", Ok<CurrentUserDto> (ClaimsPrincipal user) =>
                TypedResults.Ok(new CurrentUserDto(
                    user.FindFirstValue(ClaimTypes.Email) ?? user.Identity?.Name ?? string.Empty,
                    [.. user.FindAll(ClaimTypes.Role).Select(c => c.Value)])))
            .WithName("GetCurrentUser")
            .WithSummary("The signed-in user. 401 when not signed in.")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapGet("/csrf", Ok<CsrfTokenDto> (HttpContext http, IAntiforgery antiforgery) =>
            {
                var tokens = antiforgery.GetAndStoreTokens(http);
                return TypedResults.Ok(new CsrfTokenDto(tokens.RequestToken!, ApiConventions.AntiforgeryHeader));
            })
            .WithName("GetCsrfToken")
            .WithSummary("Antiforgery token to send in the X-XSRF-TOKEN header on admin state-changing requests.")
            .RequireAuthorization(ApiConventions.AdminPolicy);

        return api;
    }
}
