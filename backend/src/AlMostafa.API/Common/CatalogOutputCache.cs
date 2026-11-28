using AlMostafa.Application.Catalog;
using Microsoft.AspNetCore.OutputCaching;

namespace AlMostafa.API.Common;

/// <summary>
/// Public catalogue responses are cached in memory (one server) under the "catalog" tag and evicted the moment
/// an admin changes any fabric. Only anonymous GETs of public data are cached — never admin, auth or order data.
/// </summary>
internal sealed class CatalogOutputCache(IOutputCacheStore store) : ICatalogCache
{
    public const string Policy = "catalog";
    public const string Tag = "catalog";

    public async Task InvalidateAsync(CancellationToken cancellationToken) =>
        await store.EvictByTagAsync(Tag, cancellationToken);
}
