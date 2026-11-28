using FluentValidation;

namespace AlMostafa.Application.Common;

public static class ValidationExtensions
{
    /// <summary>Validates and throws <see cref="ValidationException"/> (mapped to HTTP 400 by the API).</summary>
    public static async Task EnsureValidAsync<T>(this IValidator<T> validator, T instance, CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(instance, cancellationToken);
        if (!result.IsValid)
            throw new ValidationException(result.Errors);
    }
}
