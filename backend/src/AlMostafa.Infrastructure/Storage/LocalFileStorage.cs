using AlMostafa.Application.Media;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace AlMostafa.Infrastructure.Storage;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    /// <summary>Directory where uploads are written. Relative paths resolve against the content root.</summary>
    public string UploadsPath { get; set; } = "data/uploads";

    /// <summary>URL prefix the files are served from. Kept at <c>/uploads</c> so existing photo URLs stay valid.</summary>
    public string PublicPath { get; set; } = "/uploads";

    /// <summary>Private directory for untouched uploads (never served). Relative paths resolve against the content root.</summary>
    public string OriginalsPath { get; set; } = "data/originals";
}

/// <summary>Stores files on the local disk. Swap for an object-storage implementation of <see cref="IFileStorage"/> in multi-instance deployments.</summary>
internal sealed class LocalFileStorage(IOptions<StorageOptions> options, ResolvedUploadsPath root, IHostEnvironment environment) : IFileStorage
{
    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken cancellationToken)
    {
        await WriteAsync(root.Value, content, fileName, cancellationToken);
        return $"{options.Value.PublicPath.TrimEnd('/')}/{fileName}";
    }

    public Task SaveOriginalAsync(Stream content, string fileName, CancellationToken cancellationToken) =>
        WriteAsync(Path.GetFullPath(options.Value.OriginalsPath, environment.ContentRootPath), content, fileName, cancellationToken);

    private static async Task WriteAsync(string directory, Stream content, string fileName, CancellationToken cancellationToken)
    {
        // fileName is generated server-side; still refuse anything that is not a bare file name.
        if (fileName != Path.GetFileName(fileName) || fileName.Length == 0)
            throw new ArgumentException("Invalid file name.", nameof(fileName));

        Directory.CreateDirectory(directory);
        await using var file = new FileStream(Path.Combine(directory, fileName), FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
        await content.CopyToAsync(file, cancellationToken);
    }
}

/// <summary>Absolute uploads directory, resolved once at startup.</summary>
public sealed record ResolvedUploadsPath(string Value);
