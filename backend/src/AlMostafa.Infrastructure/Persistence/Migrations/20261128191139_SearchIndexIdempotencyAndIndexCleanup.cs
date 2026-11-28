using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlMostafa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SearchIndexIdempotencyAndIndexCleanup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_order_items_fabric_id",
                table: "order_items");

            migrationBuilder.DropIndex(
                name: "ix_fabrics_hidden",
                table: "fabrics");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.AddColumn<string>(
                name: "idempotency_key",
                table: "orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "search_text",
                table: "fabrics",
                type: "character varying(6000)",
                maxLength: 6000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "ux_orders_idempotency_key",
                table: "orders",
                column: "idempotency_key",
                unique: true,
                filter: "idempotency_key IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_fabrics_search_text_trgm",
                table: "fabrics",
                column: "search_text")
                .Annotation("Npgsql:IndexMethod", "gin")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ux_orders_idempotency_key",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "ix_fabrics_search_text_trgm",
                table: "fabrics");

            migrationBuilder.DropColumn(
                name: "idempotency_key",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "search_text",
                table: "fabrics");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_fabric_id",
                table: "order_items",
                column: "fabric_id");

            migrationBuilder.CreateIndex(
                name: "ix_fabrics_hidden",
                table: "fabrics",
                column: "hidden");
        }
    }
}
