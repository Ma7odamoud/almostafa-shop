using AlMostafa.Domain.Common;
using AlMostafa.Domain.Ordering;

namespace AlMostafa.UnitTests;

public class OrderTests
{
    private static readonly DateTimeOffset Now = DateTimeOffset.UnixEpoch;

    private static OrderLine Line(string id, decimal meters, decimal price) => new(id, new LocalizedText("ق", "F"), meters, price);

    [Fact]
    public void Place_computes_total_from_lines()
    {
        var order = Order.Place("o1", "Ahmed", "Cairo", "COD", [Line("a", 2.5m, 100m), Line("b", 1.25m, 33.33m)], Now);

        Assert.Equal(250m + 41.66m, order.Total); // 1.25 * 33.33 = 41.6625 -> 41.66
        Assert.Equal("cod", order.PaymentMethod);
        Assert.Equal(OrderStatus.Pending, order.Status);
    }

    [Fact]
    public void Place_rejects_empty_orders()
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", "A", "B", "cod", [], Now));
        Assert.Equal("empty_order", ex.Code);
    }

    [Theory]
    [InlineData(0.4)]
    [InlineData(501)]
    public void Place_rejects_out_of_range_meters(decimal meters)
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", "A", "B", "cod", [Line("a", meters, 1)], Now));
        Assert.Equal("invalid_meters", ex.Code);
    }

    [Fact]
    public void Place_rejects_duplicate_fabrics()
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", "A", "B", "cod", [Line("a", 1, 1), Line("a", 2, 1)], Now));
        Assert.Equal("duplicate_item", ex.Code);
    }

    [Theory]
    [InlineData("", "B", "cod", "name_required")]
    [InlineData("A", "  ", "cod", "address_required")]
    [InlineData("A", "B", "bitcoin", "invalid_payment_method")]
    public void Place_validates_customer_details(string name, string address, string method, string code)
    {
        var ex = Assert.Throws<DomainException>(() => Order.Place("o1", name, address, method, [Line("a", 1, 1)], Now));
        Assert.Equal(code, ex.Code);
    }

    [Fact]
    public void Price_upon_inquiry_fabrics_produce_a_zero_total()
    {
        var order = Order.Place("o1", "A", "B", "card", [Line("a", 3.2m, 0m)], Now);
        Assert.Equal(0m, order.Total);
    }
}
