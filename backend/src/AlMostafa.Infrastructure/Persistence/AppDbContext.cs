using AlMostafa.Application.Common;
using AlMostafa.Domain.Catalog;
using AlMostafa.Domain.Ordering;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AlMostafa.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<IdentityUser>(options), IUnitOfWork, IDataProtectionKeyContext
{
    public DbSet<Fabric> Fabrics => Set<Fabric>();
    public DbSet<Order> Orders => Set<Order>();

    /// <summary>ASP.NET Core Data Protection keys (encrypt session cookies), shared by all API instances and kept across restarts.</summary>
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Keep every table in the same snake_case style (the Identity defaults are PascalCase "AspNet*").
        builder.Entity<IdentityUser>().ToTable("identity_users");
        builder.Entity<IdentityRole>().ToTable("identity_roles");
        builder.Entity<IdentityUserRole<string>>().ToTable("identity_user_roles");
        builder.Entity<IdentityUserClaim<string>>().ToTable("identity_user_claims");
        builder.Entity<IdentityUserLogin<string>>().ToTable("identity_user_logins");
        builder.Entity<IdentityUserToken<string>>().ToTable("identity_user_tokens");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("identity_role_claims");
        builder.Entity<DataProtectionKey>().ToTable("data_protection_keys");

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    async Task IUnitOfWork.SaveChangesAsync(CancellationToken cancellationToken) =>
        await SaveChangesAsync(cancellationToken);
}
