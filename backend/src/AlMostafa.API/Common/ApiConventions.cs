namespace AlMostafa.API.Common;

internal static class ApiConventions
{
    public const string AdminPolicy = "Admin";
    public const string CorsPolicy = "Frontend";
    public const string LoginRateLimit = "login";
    public const string OrdersRateLimit = "orders";
    public const string AntiforgeryHeader = "X-XSRF-TOKEN";
}
