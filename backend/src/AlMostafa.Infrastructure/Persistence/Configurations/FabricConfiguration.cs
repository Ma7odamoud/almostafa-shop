using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlMostafa.Infrastructure.Persistence.Configurations;

internal sealed class FabricConfiguration : IEntityTypeConfiguration<Fabric>
{
    public void Configure(EntityTypeBuilder<Fabric> b)
    {
        b.ToTable("fabrics");
        b.HasKey(f => f.Id);
        b.Property(f => f.Id).HasMaxLength(Fabric.MaxIdLength);

        Localized(b.ComplexProperty(f => f.Name), "name", Fabric.MaxNameLength);
        Localized(b.ComplexProperty(f => f.Description), "description", Fabric.MaxDescriptionLength);

        b.Property(f => f.PricePerMeter).HasPrecision(12, 2);
        b.Property(f => f.StockMeters).HasPrecision(12, 2);

        Attribute(b.ComplexProperty(f => f.Color), "color");
        Attribute(b.ComplexProperty(f => f.Material), "material");
        Attribute(b.ComplexProperty(f => f.Pattern), "pattern");
        Attribute(b.ComplexProperty(f => f.Category), "category");

        // Photos are an ordered value list that is always loaded with the fabric -> a single jsonb column.
        // Mapped through the private list field so the domain can keep exposing a read-only collection.
        b.Ignore(f => f.Photos);
        b.ComplexCollection<List<FabricPhoto>, FabricPhoto>("_photos", photos =>
        {
            photos.ToJson("photos");
            photos.Property(p => p.Src);
            photos.Property(p => p.Alt);
        });

        b.Ignore(f => f.HasPrice);

        b.HasIndex(f => f.Hidden);
        b.HasIndex(f => f.CreatedAt);
    }

    private static void Localized(ComplexPropertyBuilder<LocalizedText> text, string prefix, int maxLength)
    {
        text.Property(t => t.Ar).HasColumnName(prefix + "_ar").HasMaxLength(maxLength).IsRequired();
        text.Property(t => t.En).HasColumnName(prefix + "_en").HasMaxLength(maxLength).IsRequired();
        text.Ignore(t => t.IsEmpty);
    }

    private static void Attribute(ComplexPropertyBuilder<FabricAttribute> attribute, string prefix)
    {
        attribute.Property(a => a.Code).HasColumnName(prefix).HasMaxLength(FabricAttribute.MaxCodeLength).IsRequired();
        var label = attribute.ComplexProperty(a => a.Label);
        label.Property(t => t.Ar).HasColumnName(prefix + "_label_ar").HasMaxLength(FabricAttribute.MaxLabelLength).IsRequired();
        label.Property(t => t.En).HasColumnName(prefix + "_label_en").HasMaxLength(FabricAttribute.MaxLabelLength).IsRequired();
        label.Ignore(t => t.IsEmpty);
    }
}
