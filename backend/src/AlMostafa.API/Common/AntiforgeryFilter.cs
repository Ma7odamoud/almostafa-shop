using Microsoft.AspNetCore.Antiforgery;

namespace AlMostafa.API.Common;

/// <summary>
/// Requires a valid antiforgery token (sent in the <c>X-XSRF-TOKEN</c> header) on state-changing
/// requests authenticated by cookie. Defence in depth on top of the SameSite=Strict session cookie.
/// </summary>
internal sealed class AntiforgeryFilter(IAntiforgery antiforgery) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var method = context.HttpContext.Request.Method;
        if (!HttpMethods.IsGet(method) && !HttpMethods.IsHead(method) && !HttpMethods.IsOptions(method))
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        return await next(context);
    }
}
