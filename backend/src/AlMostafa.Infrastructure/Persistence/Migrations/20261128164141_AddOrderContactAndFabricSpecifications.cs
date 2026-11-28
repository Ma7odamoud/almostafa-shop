using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlMostafa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderContactAndFabricSpecifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "area",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "customer_email",
                table: "orders",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "customer_phone",
                table: "orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "governorate",
                table: "orders",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "care_ar",
                table: "fabrics",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "care_en",
                table: "fabrics",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "composition_ar",
                table: "fabrics",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "composition_en",
                table: "fabrics",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "season",
                table: "fabrics",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "weight_gsm",
                table: "fabrics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "width_cm",
                table: "fabrics",
                type: "numeric(5,1)",
                precision: 5,
                scale: 1,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "area",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "customer_email",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "customer_phone",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "governorate",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "care_ar",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "care_en",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "composition_ar",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "composition_en",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "season",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "weight_gsm",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "width_cm",
                table: "fabrics");
        }
    }
}
