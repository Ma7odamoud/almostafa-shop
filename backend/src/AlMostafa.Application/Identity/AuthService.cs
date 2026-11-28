using AlMostafa.Application.Common;
using FluentValidation;
using Microsoft.Extensions.Logging;

namespace AlMostafa.Application.Identity;

public sealed class AuthService(
    IIdentityService identity,
    IValidator<LoginRequest> validator,
    ILogger<AuthService> logger)
{
    public async Task LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        await validator.EnsureValidAsync(request, cancellationToken);

        var outcome = await identity.PasswordSignInAsync(request.Email!.Trim(), request.Password!, cancellationToken);
        if (outcome == SignInOutcome.Succeeded)
        {
            logger.LogInformation("Admin signed in");
            return;
        }

        // Same response for every failure reason to avoid account enumeration; the reason is logged only.
        logger.LogWarning("Failed sign-in attempt: {Outcome}", outcome);
        throw new AuthenticationFailedException();
    }

    public Task LogoutAsync() => identity.SignOutAsync();
}
