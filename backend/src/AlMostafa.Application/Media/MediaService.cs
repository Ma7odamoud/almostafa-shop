using System.Security.Cryptography;
using AlMostafa.Domain.Common;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AlMostafa.Application.Media;

public sealed class MediaOptions
{
    public const string SectionName = "Media";

    /// <summary>Maximum accepted upload size in bytes (default 20 MB — enough for full-resolution phone photos).</summary>
    public long MaxUploadBytes { get; set; } = 20 * 1024 * 1024;
}

/// <summary>Port to the file store (local disk today; S3 / R2 / Azure Blob can be added without touching callers).</summary>
public interface IFileStorage
{
    /// <summary>Stores the content under <paramref name="fileName"/> and returns its public site-relative URL.</summary>
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken cancellationToken);

    /// <summary>Keeps the untouched upload in private storage (never served: it may contain location data).</summary>
    Task SaveOriginalAsync(Stream content, string fileName, CancellationToken cancellationToken);
}

/// <summary>Port to the image codec: makes an upload web-ready (oriented, resized, metadata-free).</summary>
public interface IImageProcessor
{
    /// <exception cref="InvalidImageException">The bytes cannot be decoded as an image.</exception>
    Task<ProcessedImage> ProcessAsync(Stream source, CancellationToken cancellationToken);
}

/// <summary>
/// A web-ready photo: <see cref="Content"/> is the main image (long edge ≤ 2000 px) and <see cref="Variants"/> holds
/// narrower copies keyed by width (see <see cref="ImageVariants.Widths"/>), stored as <c>name-{width}.webp</c>.
/// </summary>
public sealed record ProcessedImage(byte[] Content, string Extension, int Width, int Height, IReadOnlyDictionary<int, byte[]> Variants);

/// <summary>Responsive sizes generated for every photo. The storefront builds its srcset from the same widths.</summary>
public static class ImageVariants
{
    public static IReadOnlyList<int> Widths { get; } = [480, 960];

    /// <summary>"abc.webp" → "abc-480.webp".</summary>
    public static string FileName(string mainFileName, int width) =>
        $"{Path.GetFileNameWithoutExtension(mainFileName)}-{width}.webp";
}

public sealed class InvalidImageException : Exception
{
    public InvalidImageException() : base("The file could not be read as an image.") { }

    public InvalidImageException(string message) : base(message) { }

    public InvalidImageException(string message, Exception innerException) : base(message, innerException) { }
}

public sealed record UploadResultDto(string Url);

public sealed class MediaService(IFileStorage storage, IImageProcessor images, IOptions<MediaOptions> options, ILogger<MediaService> logger)
{
    private const int SniffLength = 16;

    public async Task<UploadResultDto> UploadImageAsync(Stream content, long length, CancellationToken cancellationToken)
    {
        if (length <= 0)
            throw new DomainException("file_required", "No file provided.");
        if (length > options.Value.MaxUploadBytes)
            throw new DomainException("file_too_large", $"Photos must be at most {options.Value.MaxUploadBytes / (1024 * 1024)} MB.");

        // Identify the type from the file's magic bytes; the client-declared name and MIME type are not trusted.
        var header = new byte[SniffLength];
        var read = await content.ReadAtLeastAsync(header, SniffLength, throwOnEndOfStream: false, cancellationToken);
        if (DetectImageExtension(header.AsSpan(0, read)) is null)
            throw new DomainException("unsupported_media_type",
                "Only JPEG, PNG and WebP photos are accepted. On iPhone, set Camera → Formats → Most Compatible.");

        ProcessedImage processed;
        using var original = new MemoryStream();
        try
        {
            using var full = new ConcatenatedStream(header.AsMemory(0, read), content);
            await full.CopyToAsync(original, cancellationToken);
            original.Position = 0;
            processed = await images.ProcessAsync(original, cancellationToken);
        }
        catch (InvalidImageException)
        {
            throw new DomainException("unsupported_media_type", "The photo could not be read. Please try another file.");
        }

        var baseName = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(16));
        var fileName = $"{baseName}.{processed.Extension}";

        // Variants first, main file last: a URL is only returned once every size exists.
        foreach (var (width, bytes) in processed.Variants)
        {
            using var variant = new MemoryStream(bytes, writable: false);
            await storage.SaveAsync(variant, ImageVariants.FileName(fileName, width), cancellationToken);
        }
        original.Position = 0;
        await storage.SaveOriginalAsync(original, $"{baseName}.{DetectImageExtension(header.AsSpan(0, read))}", cancellationToken);
        using var output = new MemoryStream(processed.Content, writable: false);
        var url = await storage.SaveAsync(output, fileName, cancellationToken);

        logger.LogInformation("Uploaded photo {FileName}: {InputBytes} bytes in, {Width}x{Height} {OutputBytes} bytes stored",
            fileName, length, processed.Width, processed.Height, processed.Content.Length);
        return new UploadResultDto(url);
    }

    internal static string? DetectImageExtension(ReadOnlySpan<byte> h)
    {
        if (h.Length >= 3 && h[0] == 0xFF && h[1] == 0xD8 && h[2] == 0xFF) return "jpg";
        if (h.Length >= 8 && h[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) return "png";
        if (h.Length >= 12 && h[..4].SequenceEqual("RIFF"u8) && h[8..12].SequenceEqual("WEBP"u8)) return "webp";
        return null;
    }

    /// <summary>Replays the already-read header bytes followed by the rest of the source stream.</summary>
    private sealed class ConcatenatedStream(ReadOnlyMemory<byte> prefix, Stream rest) : Stream
    {
        private int _position;

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => throw new NotSupportedException();
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }

        public override int Read(byte[] buffer, int offset, int count) => Read(buffer.AsSpan(offset, count));

        public override int Read(Span<byte> buffer)
        {
            if (_position < prefix.Length)
            {
                var n = Math.Min(buffer.Length, prefix.Length - _position);
                prefix.Span.Slice(_position, n).CopyTo(buffer);
                _position += n;
                return n;
            }
            return rest.Read(buffer);
        }

        public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
        {
            if (_position < prefix.Length)
            {
                var n = Math.Min(buffer.Length, prefix.Length - _position);
                prefix.Slice(_position, n).CopyTo(buffer);
                _position += n;
                return n;
            }
            return await rest.ReadAsync(buffer, cancellationToken);
        }

        public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
            ReadAsync(buffer.AsMemory(offset, count), cancellationToken).AsTask();

        public override void Flush() { }
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    }
}
