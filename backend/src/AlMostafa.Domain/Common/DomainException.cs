namespace AlMostafa.Domain.Common;

/// <summary>
/// Thrown when an operation would violate a business invariant.
/// Carries a stable machine-readable <see cref="Code"/> that the API maps to a 4xx response.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string code, string message) : base(message) => Code = code;

    public DomainException() : this("domain_error", "A business rule was violated.") { }

    public DomainException(string message) : this("domain_error", message) { }

    public DomainException(string message, Exception innerException) : base(message, innerException) => Code = "domain_error";

    public string Code { get; }
}

/// <summary>Thrown when a requested aggregate does not exist (or is not visible to the caller).</summary>
public sealed class NotFoundException : DomainException
{
    public NotFoundException(string resource, string id)
        : base("not_found", $"{resource} '{id}' was not found.") { }

    public NotFoundException() : base("not_found", "The resource was not found.") { }

    public NotFoundException(string message) : base("not_found", message) { }

    public NotFoundException(string message, Exception innerException) : base(message, innerException) { }
}
