using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace INTEX.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateContentRecommendationKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContentRecommendations",
                columns: table => new
                {
                    SourceShowID = table.Column<string>(type: "TEXT", nullable: false),
                    Recommendation1 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation2 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation3 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation4 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation5 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation6 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation7 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation8 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation9 = table.Column<string>(type: "TEXT", nullable: true),
                    Recommendation10 = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentRecommendations", x => x.SourceShowID);
                });

            migrationBuilder.CreateTable(
                name: "MoviesTitles",
                columns: table => new
                {
                    Show_Id = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Director = table.Column<string>(type: "TEXT", nullable: false),
                    Cast = table.Column<string>(type: "TEXT", nullable: false),
                    Release_Year = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoviesTitles", x => x.Show_Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentRecommendations");

            migrationBuilder.DropTable(
                name: "MoviesTitles");
        }
    }
}
