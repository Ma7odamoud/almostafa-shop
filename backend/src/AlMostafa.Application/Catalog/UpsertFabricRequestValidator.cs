using AlMostafa.Domain.Catalog;
using FluentValidation;

namespace AlMostafa.Application.Catalog;

/// <summary>
/// Request-shape validation with field-level messages. Business invariants are additionally
/// enforced by the <see cref="Fabric"/> aggregate itself.
/// </summary>
public sealed class UpsertFabricRequestValidator : AbstractValidator<UpsertFabricRequest>
{
    public UpsertFabricRequestValidator()
    {
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.NameAr) || !string.IsNullOrWhiteSpace(x.NameEn))
            .WithName("name")
            .WithMessage("Please provide at least a name in English or Arabic.");

        RuleFor(x => x.NameAr).MaximumLength(Fabric.MaxNameLength);
        RuleFor(x => x.NameEn).MaximumLength(Fabric.MaxNameLength);
        RuleFor(x => x.DescriptionAr).MaximumLength(Fabric.MaxDescriptionLength);
        RuleFor(x => x.DescriptionEn).MaximumLength(Fabric.MaxDescriptionLength);
        RuleFor(x => x.PricePerMeter).InclusiveBetween(0, Fabric.MaxPrice);
        RuleFor(x => x.StockMeters).InclusiveBetween(0, Fabric.MaxStock);
        RuleFor(x => x.Color).MaximumLength(FabricAttribute.MaxCodeLength);
        RuleFor(x => x.Material).MaximumLength(FabricAttribute.MaxCodeLength);

        RuleFor(x => x.Pattern)
            .Must(p => FabricTaxonomy.Patterns.Any(a => a.Code == p?.Trim().ToLowerInvariant()))
            .WithMessage($"Pattern must be one of: {string.Join(", ", FabricTaxonomy.Patterns.Select(p => p.Code))}.");
        RuleFor(x => x.Category)
            .Must(c => FabricTaxonomy.Categories.Any(a => a.Code == c?.Trim().ToLowerInvariant()))
            .WithMessage($"Category must be one of: {string.Join(", ", FabricTaxonomy.Categories.Select(c => c.Code))}.");

        RuleFor(x => x.Photos!.Count).LessThanOrEqualTo(Fabric.MaxPhotos).When(x => x.Photos is not null).WithName("photos");
        RuleForEach(x => x.Photos).ChildRules(photo =>
        {
            photo.RuleFor(p => p.Src).NotEmpty().MaximumLength(FabricPhoto.MaxSrcLength)
                .Must(src => src.StartsWith('/') && !src.StartsWith("//", StringComparison.Ordinal))
                .WithMessage("Photo source must be a site-relative path such as /uploads/photo.jpg.");
            photo.RuleFor(p => p.Alt).MaximumLength(FabricPhoto.MaxAltLength);
        });
    }
}
