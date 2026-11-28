using AlMostafa.Application.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Infrastructure.Identity;

/// <summary>
/// Bootstraps the administrator account from configuration, preserving the original setup where the
/// admin logged in with <c>ADMIN_EMAIL</c> / <c>ADMIN_PASSWORD</c>. The password is now stored as a salted hash.
/// </summary>
/// <remarks>
/// <list type="bullet">
///   <item>If the user does not exist it is created and added to the Admin role.</item>
///   <item>If <c>ADMIN_PASSWORD</c> is set and differs from the stored one, the stored hash is updated (environment stays the source of truth).</item>
///   <item>Once the account exists, <c>ADMIN_PASSWORD</c> may be removed from the environment.</item>
/// </list>
/// </remarks>
internal sealed class AdminSeeder(
    UserManager<IdentityUser> users,
    RoleManager<IdentityRole> roles,
    IConfiguration configuration,
    ILogger<AdminSeeder> logger)
{
    public async Task SeedAsync()
    {
        if (!await roles.RoleExistsAsync(Roles.Admin))
            Ensure(await roles.CreateAsync(new IdentityRole(Roles.Admin)), "create Admin role");

        var email = (configuration["Admin:Email"] ?? configuration["ADMIN_EMAIL"])?.Trim();
        var password = configuration["Admin:Password"] ?? configuration["ADMIN_PASSWORD"];
        if (string.IsNullOrEmpty(email))
        {
            logger.LogWarning("ADMIN_EMAIL is not configured; no administrator account will be bootstrapped");
            return;
        }

        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            if (string.IsNullOrEmpty(password))
            {
                logger.LogWarning("Admin account {Email} does not exist and ADMIN_PASSWORD is not set; skipping", email);
                return;
            }
            user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            Ensure(await users.CreateAsync(user, password), "create admin user");
            logger.LogInformation("Administrator account created for {Email}", email);
        }
        else if (!string.IsNullOrEmpty(password) && !await users.CheckPasswordAsync(user, password))
        {
            var token = await users.GeneratePasswordResetTokenAsync(user);
            Ensure(await users.ResetPasswordAsync(user, token, password), "update admin password");
            logger.LogInformation("Administrator password updated from configuration for {Email}", email);
        }

        if (!await users.IsInRoleAsync(user, Roles.Admin))
            Ensure(await users.AddToRoleAsync(user, Roles.Admin), "add admin to role");
    }

    private void Ensure(IdentityResult result, string action)
    {
        if (result.Succeeded) return;
        var errors = string.Join("; ", result.Errors.Select(e => e.Description));
        logger.LogError("Failed to {Action}: {Errors}", action, errors);
        throw new InvalidOperationException($"Failed to {action}: {errors}");
    }
}
