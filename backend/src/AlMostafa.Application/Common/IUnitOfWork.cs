namespace AlMostafa.Application.Common;

/// <summary>Commits all pending changes made through the repositories as one transaction.</summary>
public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
