using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Infrastructure.Persistence;

/// <summary>
/// Logs database commands slower than <c>Database:SlowQueryMilliseconds</c> (default 200 ms) as warnings.
/// Only the SQL text is logged (parameter placeholders, never values), so no customer data reaches the logs.
/// </summary>
internal sealed class SlowQueryInterceptor(IConfiguration configuration, ILogger<SlowQueryInterceptor> logger) : DbCommandInterceptor
{
    private readonly TimeSpan _threshold = TimeSpan.FromMilliseconds(configuration.GetValue("Database:SlowQueryMilliseconds", 200));

    public override ValueTask<DbDataReader> ReaderExecutedAsync(DbCommand command, CommandExecutedEventData eventData, DbDataReader result, CancellationToken cancellationToken = default)
    {
        Check(command, eventData);
        return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override ValueTask<object?> ScalarExecutedAsync(DbCommand command, CommandExecutedEventData eventData, object? result, CancellationToken cancellationToken = default)
    {
        Check(command, eventData);
        return base.ScalarExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override ValueTask<int> NonQueryExecutedAsync(DbCommand command, CommandExecutedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        Check(command, eventData);
        return base.NonQueryExecutedAsync(command, eventData, result, cancellationToken);
    }

    private void Check(DbCommand command, CommandExecutedEventData eventData)
    {
        if (eventData.Duration >= _threshold)
            logger.LogWarning("Slow database command ({ElapsedMs} ms): {Sql}", (long)eventData.Duration.TotalMilliseconds, command.CommandText);
    }
}
