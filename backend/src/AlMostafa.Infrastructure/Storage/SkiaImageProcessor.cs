using AlMostafa.Application.Media;
using SkiaSharp;

namespace AlMostafa.Infrastructure.Storage;

/// <summary>
/// Re-encodes uploaded photos for the web: applies the camera's rotation, scales the long edge down to
/// <see cref="MaxEdge"/> pixels and writes a fresh WebP file. Re-encoding drops all metadata, including
/// the GPS location phones embed in photos.
/// </summary>
internal sealed class SkiaImageProcessor : IImageProcessor
{
    private const int MaxEdge = 2000;
    private const int Quality = 82;

    public async Task<ProcessedImage> ProcessAsync(Stream source, CancellationToken cancellationToken)
    {
        using var buffer = new MemoryStream();
        await source.CopyToAsync(buffer, cancellationToken);
        buffer.Position = 0;

        using var codec = SKCodec.Create(buffer) ?? throw new InvalidImageException();
        var info = codec.Info.WithColorType(SKColorType.Rgba8888).WithAlphaType(SKAlphaType.Premul);
        using var decoded = new SKBitmap(info);
        var result = codec.GetPixels(info, decoded.GetPixels());
        if (result is not (SKCodecResult.Success or SKCodecResult.IncompleteInput))
            throw new InvalidImageException();

        using var oriented = ApplyOrientation(decoded, codec.EncodedOrigin);
        using var resized = Resize(oriented);
        using var image = SKImage.FromBitmap(resized);
        using var data = image.Encode(SKEncodedImageFormat.Webp, Quality) ?? throw new InvalidImageException();

        return new ProcessedImage(data.ToArray(), "webp", resized.Width, resized.Height);
    }

    private static SKBitmap Resize(SKBitmap bitmap)
    {
        var longEdge = Math.Max(bitmap.Width, bitmap.Height);
        if (longEdge <= MaxEdge) return bitmap.Copy();

        var scale = MaxEdge / (double)longEdge;
        var size = new SKImageInfo((int)Math.Round(bitmap.Width * scale), (int)Math.Round(bitmap.Height * scale), bitmap.ColorType, bitmap.AlphaType);
        return bitmap.Resize(size, new SKSamplingOptions(SKCubicResampler.Mitchell)) ?? throw new InvalidImageException();
    }

    /// <summary>Rotates/flips the pixels so the photo displays upright without relying on (removed) EXIF data.</summary>
    private static SKBitmap ApplyOrientation(SKBitmap bitmap, SKEncodedOrigin origin)
    {
        if (origin is SKEncodedOrigin.TopLeft or SKEncodedOrigin.Default)
            return bitmap.Copy();

        var swap = origin is SKEncodedOrigin.LeftTop or SKEncodedOrigin.RightTop or SKEncodedOrigin.RightBottom or SKEncodedOrigin.LeftBottom;
        var width = swap ? bitmap.Height : bitmap.Width;
        var height = swap ? bitmap.Width : bitmap.Height;
        var rotated = new SKBitmap(new SKImageInfo(width, height, bitmap.ColorType, bitmap.AlphaType));

        using var canvas = new SKCanvas(rotated);
        switch (origin)
        {
            case SKEncodedOrigin.TopRight: canvas.Scale(-1, 1, width / 2f, 0); break;
            case SKEncodedOrigin.BottomRight: canvas.RotateDegrees(180, width / 2f, height / 2f); break;
            case SKEncodedOrigin.BottomLeft: canvas.Scale(1, -1, 0, height / 2f); break;
            case SKEncodedOrigin.LeftTop: canvas.Translate(width, 0); canvas.RotateDegrees(90); canvas.Scale(1, -1, 0, bitmap.Height / 2f); break;
            case SKEncodedOrigin.RightTop: canvas.Translate(width, 0); canvas.RotateDegrees(90); break;
            case SKEncodedOrigin.RightBottom: canvas.Translate(0, height); canvas.RotateDegrees(-90); canvas.Scale(1, -1, 0, bitmap.Height / 2f); break;
            case SKEncodedOrigin.LeftBottom: canvas.Translate(0, height); canvas.RotateDegrees(-90); break;
        }
        canvas.DrawBitmap(bitmap, 0, 0);
        canvas.Flush();
        return rotated;
    }
}
