using System.Security.Cryptography;
using AlMostafa.Domain.Common;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AlMostafa.Application.Media;

public sealed class MediaOptions
{
    public const string SectionName = "Media";

    /// <summary>Maximum accepted upload size in bytes (default 8 MB).</summary>
    public long MaxUploadBytes { get; set; } = 8 * 1024 * 1024;
}

/// <summary>Port to the file store (local disk today; S3 / R2 / Azure Blob can be added without touching callers).</summary>
public interface IFileStorage
{
    /// <summary>Stores the content under <paramref name="fileName"/> and returns its public site-relative URL.</summary>
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken cancellationToken);
}

public sealed record UploadResultDto(string Url);

public sealed class MediaService(IFileStorage storage, IOptions<MediaOptions> options, ILogger<MediaService> logger)
{
    private const int SniffLength = 16;

    public async Task<UploadResultDto> UploadImageAsync(Stream content, long length, CancellationToken cancellationToken)
    {
        if (length <= 0)
            throw new DomainException("file_required", "No file provided.");
        if (length > options.Value.MaxUploadBytes)
            throw new DomainException("file_too_large", $"Files must be at most {options.Value.MaxUploadBytes / (1024 * 1024)} MB.");

        // Identify the type from the file's magic bytes; the client-declared name and MIME type are not trusted.
        var header = new byte[SniffLength];
        var read = await content.ReadAtLeastAsync(header, SniffLength, throwOnEndOfStream: false, cancellationToken);
        var extension = DetectImageExtension(header.AsSpan(0, read))
            ?? throw new DomainException("unsupported_media_type", "Only JPEG, PNG, WebP, GIF and AVIF images are allowed.");

        var fileName = $"{Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(16))}.{extension}";
        using var full = new ConcatenatedStream(header.AsMemory(0, read), content);
        var url = await storage.SaveAsync(full, fileName, cancellationToken);

        logger.LogInformation("Uploaded image {FileName} ({Bytes} bytes)", fileName, length);
        return new UploadResultDto(url);
    }

    internal static string? DetectImageExtension(ReadOnlySpan<byte> h)
    {
        if (h.Length >= 3 && h[0] == 0xFF && h[1] == 0xD8 && h[2] == 0xFF) return "jpg";
        if (h.Length >= 8 && h[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) return "png";
        if (h.Length >= 6 && (h[..6].SequenceEqual("GIF87a"u8) || h[..6].SequenceEqual("GIF89a"u8))) return "gif";
        if (h.Length >= 12 && h[..4].SequenceEqual("RIFF"u8) && h[8..12].SequenceEqual("WEBP"u8)) return "webp";
        if (h.Length >= 12 && h[4..8].SequenceEqual("ftyp"u8) && (h[8..12].SequenceEqual("avif"u8) || h[8..12].SequenceEqual("avis"u8))) return "avif";
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
