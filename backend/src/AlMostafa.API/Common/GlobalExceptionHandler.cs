using AlMostafa.Application.Identity;
using AlMostafa.Domain.Common;
using FluentValidation;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlMostafa.API.Common;

/// <summary>
/// Translates exceptions into RFC 9457 Problem Details. Every error response carries a stable
/// <c>code</c> the frontend can branch on, plus the <c>traceId</c> for log correlation.
/// Unexpected exceptions are logged and returned without internal details.
/// </summary>
internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private static readonly Dictionary<string, int> DomainStatusCodes = new(StringComparer.Ordinal)
    {
        ["fabric_unavailable"] = StatusCodes.Status409Conflict,
        ["file_too_large"] = StatusCodes.Status413PayloadTooLarge,
        ["unsupported_media_type"] = StatusCodes.Status415UnsupportedMediaType,
    };

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, code, title, detail, errors) = exception switch
        {
            ValidationException v => (StatusCodes.Status400BadRequest, "validation_failed", "One or more validation errors occurred.",
                v.Errors.FirstOrDefault()?.ErrorMessage, ToErrors(v)),
            NotFoundException n => (StatusCodes.Status404NotFound, n.Code, "Not found", n.Message, null),
            DomainException d => (DomainStatusCodes.GetValueOrDefault(d.Code, StatusCodes.Status400BadRequest), d.Code, "Request could not be completed", d.Message, null),
            AuthenticationFailedException a => (StatusCodes.Status401Unauthorized, "invalid_credentials", "Invalid credentials", a.Message, null),
            AntiforgeryValidationException => (StatusCodes.Status403Forbidden, "invalid_csrf_token", "Invalid or missing CSRF token", null, null),
            BadHttpRequestException b => (b.StatusCode, "bad_request", "Bad request", "The request is malformed or contains invalid values.", null),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "concurrency_conflict", "The resource was modified by someone else", null, null),
            OperationCanceledException when httpContext.RequestAborted.IsCancellationRequested => (499, "client_closed_request", "Client closed request", null, null),
            _ => (StatusCodes.Status500InternalServerError, "internal_error", "An unexpected error occurred", null, (Dictionary<string, string[]>?)null),
        };

        if (status >= 500)
            logger.LogError(exception, "Unhandled exception for {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);
        else
            logger.LogInformation("Request rejected with {Status} {Code}: {Message}", status, code, detail ?? title);

        httpContext.Response.StatusCode = status;
        var problem = new ProblemDetails { Status = status, Title = title, Detail = detail };
        problem.Extensions["code"] = code;
        if (errors is not null)
            problem.Extensions["errors"] = errors;

        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception,
        });
    }

    private static Dictionary<string, string[]> ToErrors(ValidationException v) =>
        v.Errors
            .GroupBy(e => JsonName(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

    // "Items[0].Meters" -> "items[0].meters", matching the camelCase JSON contract.
    private static string JsonName(string propertyName) =>
        string.Join('.', propertyName.Split('.').Select(p => p.Length == 0 ? p : char.ToLowerInvariant(p[0]) + p[1..]));
}
