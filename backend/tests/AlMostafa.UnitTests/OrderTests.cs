using AlMostafa.Domain.Common;
using AlMostafa.Domain.Ordering;

namespace AlMostafa.UnitTests;

public class OrderTests
{
    private static readonly DateTimeOffset Now = DateTimeOffset.UnixEpoch;

    private static OrderCustomer Customer(string name = "Ahmed", string phone = "01012345678", string? email = null,
        string governorate = "cairo", string area = "Zamalek", string address = "12 Street") =>
        new(name, phone, email, governorate, area, address);

    private static OrderLine Line(string id, decimal meters, decimal price) => new(id, new LocalizedText("ق", "F"), meters, price);

    [Fact]
    public void Place_computes_total_from_lines()
    {
        var order = Order.Place("o1", Customer(), "COD", [Line("a", 2.5m, 100m), Line("b", 1.25m, 33.33m)], Now);

        Assert.Equal(250m + 41.66m, order.Total); // 1.25 * 33.33 = 41.6625 -> 41.66
        Assert.Equal("cod", order.PaymentMethod);
        Assert.Equal(OrderStatus.Pending, order.Status);
    }

    [Fact]
    public void Place_rejects_empty_orders()
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", Customer(), "cod", [], Now));
        Assert.Equal("empty_order", ex.Code);
    }

    [Theory]
    [InlineData(0.4)]
    [InlineData(501)]
    public void Place_rejects_out_of_range_meters(decimal meters)
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", Customer(), "cod", [Line("a", meters, 1)], Now));
        Assert.Equal("invalid_meters", ex.Code);
    }

    [Fact]
    public void Place_rejects_duplicate_fabrics()
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", Customer(), "cod", [Line("a", 1, 1), Line("a", 2, 1)], Now));
        Assert.Equal("duplicate_item", ex.Code);
    }

    [Theory]
    [InlineData("", "01012345678", "cairo", "Area", "B", "cod", "name_required")]
    [InlineData("A", "01012345678", "cairo", "Area", "  ", "cod", "address_required")]
    [InlineData("A", "01012345678", "cairo", "", "B", "cod", "area_required")]
    [InlineData("A", "01012345678", "alexandria", "Area", "B", "cod", "invalid_governorate")]
    [InlineData("A", "0101234", "cairo", "Area", "B", "cod", "invalid_phone")]
    [InlineData("A", "01012345678", "cairo", "Area", "B", "bank-transfer", "invalid_payment_method")]
    public void Place_validates_customer_details(string name, string phone, string governorate, string area, string address, string method, string code)
    {
        var ex = Assert.Throws<DomainException>(() =>
            Order.Place("o1", new OrderCustomer(name, phone, null, governorate, area, address), method, [Line("a", 1, 1)], Now));
        Assert.Equal(code, ex.Code);
    }

    [Theory]
    [InlineData("wallet")]
    [InlineData("card")]
    [InlineData("COD")]
    public void Place_accepts_the_store_payment_methods(string method)
    {
        var order = Order.Place("o1", Customer(), method, [Line("a", 1, 1)], Now);
        Assert.Equal(method.ToLowerInvariant(), order.PaymentMethod);
    }

    [Theory]
    [InlineData("01012345678", "+201012345678")]
    [InlineData("+20 115 123 4567", "+201151234567")]
    [InlineData("00201212345678", "+201212345678")]
    [InlineData("٠١٥٥٥١٢٣٤٥٦", "+201555123456")]
    [InlineData("011-2345-6789", "+201123456789")]
    public void Phone_numbers_are_normalised_to_international_form(string input, string expected)
    {
        Assert.Equal(expected, EgyptianMobile.Normalize(input));
    }

    [Theory]
    [InlineData("0101234567")]   // too short
    [InlineData("01312345678")]  // no 013 operator
    [InlineData("0221234567")]   // landline
    [InlineData("abc")]
    public void Invalid_phone_numbers_are_rejected(string input)
    {
        Assert.False(EgyptianMobile.TryNormalize(input, out _));
    }

    [Fact]
    public void Email_is_optional_but_validated_when_given()
    {
        Assert.Null(Order.Place("o1", Customer(email: "  "), "cod", [Line("a", 1, 1)], Now).CustomerEmail);
        Assert.Equal("a@b.co", Order.Place("o1", Customer(email: "a@b.co"), "cod", [Line("a", 1, 1)], Now).CustomerEmail);
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", Customer(email: "not-an-email"), "cod", [Line("a", 1, 1)], Now));
        Assert.Equal("invalid_email", ex.Code);
    }

    [Fact]
    public void Place_stores_contact_and_delivery_details()
    {
        var order = Order.Place("o1", Customer(governorate: "GIZA", area: "Dokki"), "wallet", [Line("a", 1, 1)], Now);

        Assert.Equal("+201012345678", order.CustomerPhone);
        Assert.Equal("giza", order.Governorate);
        Assert.Equal("Dokki", order.Area);
    }

    [Fact]
    public void Price_upon_inquiry_fabrics_produce_a_zero_total()
    {
        var order = Order.Place("o1", Customer(), "card", [Line("a", 3.2m, 0m)], Now);
        Assert.Equal(0m, order.Total);
    }
}
