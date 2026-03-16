using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdAndNewLogFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "TravelLogs",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_TravelLogs_UserId",
                table: "TravelLogs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TravelLogs_AspNetUsers_UserId",
                table: "TravelLogs",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TravelLogs_AspNetUsers_UserId",
                table: "TravelLogs");

            migrationBuilder.DropIndex(
                name: "IX_TravelLogs_UserId",
                table: "TravelLogs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "TravelLogs");
        }
    }
}
