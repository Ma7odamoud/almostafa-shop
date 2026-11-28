using AlMostafa.Domain.Ordering;
using FluentValidation;

namespace AlMostafa.Application.Ordering;

public sealed class PlaceOrderRequestValidator : AbstractValidator<PlaceOrderRequest>
{
    public PlaceOrderRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.").MaximumLength(Order.MaxNameLength);
        RuleFor(x => x.Address).NotEmpty().WithMessage("Address is required.").MaximumLength(Order.MaxAddressLength);
        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required.")
            .Must(m => PaymentMethods.All.Contains(m?.Trim().ToLowerInvariant()))
            .WithMessage($"Payment method must be one of: {string.Join(", ", PaymentMethods.All)}.");

        RuleFor(x => x.Items).NotEmpty().WithMessage("Your cart is empty.");
        RuleFor(x => x.Items!.Count).LessThanOrEqualTo(Order.MaxItems).When(x => x.Items is not null).WithName("items");
        RuleFor(x => x.Items)
            .Must(items => items!.Select(i => i.FabricId).Distinct().Count() == items!.Count)
            .When(x => x.Items is { Count: > 0 })
            .WithMessage("Each fabric may appear only once.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.FabricId).NotEmpty().MaximumLength(64);
            item.RuleFor(i => i.Meters).InclusiveBetween(OrderItem.MinMeters, OrderItem.MaxMeters);
        });
    }
}
