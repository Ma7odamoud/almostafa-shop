using FluentValidation;

namespace AlMostafa.Application.Identity;

public static class Roles
{
    public const string Admin = "Admin";
}

public sealed record LoginRequest(string? Email, string? Password);

public sealed record CurrentUserDto(string Email, IReadOnlyList<string> Roles);

public enum SignInOutcome
{
    Succeeded,
    InvalidCredentials,
    LockedOut,
    NotAllowed,
}

/// <summary>Port to the identity provider (ASP.NET Core Identity in Infrastructure).</summary>
public interface IIdentityService
{
    /// <summary>Verifies the password and, on success, issues the authentication cookie.</summary>
    Task<SignInOutcome> PasswordSignInAsync(string email, string password, CancellationToken cancellationToken);

    Task SignOutAsync();
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(256);
    }
}

/// <summary>Thrown when sign-in fails. Deliberately carries no detail about why.</summary>
public sealed class AuthenticationFailedException : Exception
{
    public AuthenticationFailedException() : base("Invalid credentials") { }

    public AuthenticationFailedException(string message) : base(message) { }

    public AuthenticationFailedException(string message, Exception innerException) : base(message, innerException) { }
}
