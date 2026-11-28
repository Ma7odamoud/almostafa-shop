using AlMostafa.Domain.Ordering;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlMostafa.Infrastructure.Persistence.Configurations;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public const string IdempotencyIndex = "ux_orders_idempotency_key";

    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ToTable("orders");
        b.HasKey(o => o.Id);
        b.Property(o => o.Id).HasMaxLength(Order.MaxIdLength);
        b.Property(o => o.CustomerName).HasMaxLength(Order.MaxNameLength).IsRequired();
        b.Property(o => o.CustomerPhone).HasMaxLength(20).IsRequired();
        b.Property(o => o.CustomerEmail).HasMaxLength(Order.MaxEmailLength);
        b.Property(o => o.Governorate).HasMaxLength(32).IsRequired();
        b.Property(o => o.Area).HasMaxLength(Order.MaxAreaLength).IsRequired();
        b.Property(o => o.ShippingAddress).HasMaxLength(Order.MaxAddressLength).IsRequired();
        b.Property(o => o.PaymentMethod).HasMaxLength(32).IsRequired();
        b.Property(o => o.Status).HasConversion<string>().HasMaxLength(32);
        b.Property(o => o.Total).HasPrecision(14, 2);
        b.HasIndex(o => o.CreatedAt);
        b.Property(o => o.IdempotencyKey).HasMaxLength(Order.MaxIdempotencyKeyLength);
        b.HasIndex(o => o.IdempotencyKey).IsUnique().HasDatabaseName(IdempotencyIndex).HasFilter("idempotency_key IS NOT NULL");

        b.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey("OrderId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
        b.Navigation(o => o.Items).UsePropertyAccessMode(PropertyAccessMode.Field).AutoInclude();
    }
}

internal sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> b)
    {
        b.ToTable("order_items");
        b.HasKey(i => i.Id);
        // No FK to fabrics on purpose: an order line is a historical snapshot and must survive fabric deletion.
        b.Property(i => i.FabricId).HasMaxLength(64).IsRequired();
        b.ComplexProperty(i => i.FabricName, n =>
        {
            n.Property(t => t.Ar).HasColumnName("fabric_name_ar").HasMaxLength(200).IsRequired();
            n.Property(t => t.En).HasColumnName("fabric_name_en").HasMaxLength(200).IsRequired();
            n.Ignore(t => t.IsEmpty);
        });
        b.Property(i => i.Meters).HasPrecision(10, 2);
        b.Property(i => i.PricePerMeter).HasPrecision(12, 2);
        b.Ignore(i => i.LineTotal);
    }
}
