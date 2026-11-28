namespace AlMostafa.Application.Catalog;

/// <summary>
/// Cached public catalogue responses. Every change to a fabric calls <see cref="InvalidateAsync"/> right after the
/// database commit, so customers never see stale prices, visibility or photos.
/// </summary>
public interface ICatalogCache
{
    Task InvalidateAsync(CancellationToken cancellationToken);
}
