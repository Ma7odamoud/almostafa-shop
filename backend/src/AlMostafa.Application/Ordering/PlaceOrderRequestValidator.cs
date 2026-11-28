using AlMostafa.Domain.Ordering;
using FluentValidation;

namespace AlMostafa.Application.Ordering;

public sealed class PlaceOrderRequestValidator : AbstractValidator<PlaceOrderRequest>
{
    public PlaceOrderRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.").MaximumLength(Order.MaxNameLength);
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Must(p => EgyptianMobile.TryNormalize(p, out _))
            .WithMessage("Please enter a valid Egyptian mobile number, e.g. 01012345678.");
        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Please enter a valid email address or leave it empty.")
            .MaximumLength(Order.MaxEmailLength)
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Governorate)
            .NotEmpty().WithMessage("Please choose Cairo or Giza.")
            .Must(g => DeliveryAreas.Governorates.Any(a => a.Code == g?.Trim().ToLowerInvariant()))
            .WithMessage($"We currently deliver to: {string.Join(", ", DeliveryAreas.Governorates.Select(g => g.Label.En))}.");
        RuleFor(x => x.Area).NotEmpty().WithMessage("Area is required.").MaximumLength(Order.MaxAreaLength);
        RuleFor(x => x.Address).NotEmpty().WithMessage("Address is required.").MaximumLength(Order.MaxAddressLength);
        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required.")
            .Must(m => PaymentMethods.All.Any(o => o.Code == m?.Trim().ToLowerInvariant()))
            .WithMessage($"Payment method must be one of: {string.Join(", ", PaymentMethods.All.Select(o => o.Code))}.");

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
