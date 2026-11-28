using AlMostafa.Application.Identity;
using Microsoft.AspNetCore.Identity;

namespace AlMostafa.Infrastructure.Identity;

/// <summary>ASP.NET Core Identity adapter: password verification, lockout, and the authentication cookie.</summary>
internal sealed class IdentityService(SignInManager<IdentityUser> signInManager) : IIdentityService
{
    public async Task<SignInOutcome> PasswordSignInAsync(string email, string password, CancellationToken cancellationToken)
    {
        var user = await signInManager.UserManager.FindByEmailAsync(email);
        if (user is null)
            return SignInOutcome.InvalidCredentials;

        // Only administrators may sign in; there are no customer accounts yet.
        if (!await signInManager.UserManager.IsInRoleAsync(user, Roles.Admin))
            return SignInOutcome.NotAllowed;

        var result = await signInManager.PasswordSignInAsync(user, password, isPersistent: true, lockoutOnFailure: true);
        if (result.Succeeded) return SignInOutcome.Succeeded;
        if (result.IsLockedOut) return SignInOutcome.LockedOut;
        if (result.IsNotAllowed) return SignInOutcome.NotAllowed;
        return SignInOutcome.InvalidCredentials;
    }

    public Task SignOutAsync() => signInManager.SignOutAsync();
}
