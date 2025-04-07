using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace INTEX.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "movies_titles",
                columns: table => new
                {
                    show_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    type = table.Column<string>(type: "TEXT", nullable: false),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    director = table.Column<string>(type: "TEXT", nullable: false),
                    cast = table.Column<string>(type: "TEXT", nullable: false),
                    country = table.Column<string>(type: "TEXT", nullable: false),
                    release_year = table.Column<int>(type: "INTEGER", nullable: false),
                    rating = table.Column<string>(type: "TEXT", nullable: false),
                    duration = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: false),
                    Action = table.Column<int>(type: "INTEGER", nullable: false),
                    Adventure = table.Column<int>(type: "INTEGER", nullable: false),
                    Anime_Series_International_TV_Shows = table.Column<int>(type: "INTEGER", nullable: false),
                    British_TV_Shows_Docuseries_International_TV_Shows = table.Column<int>(type: "INTEGER", nullable: false),
                    Children = table.Column<int>(type: "INTEGER", nullable: false),
                    Comedies = table.Column<int>(type: "INTEGER", nullable: false),
                    Comedies_Dramas_International_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Comedies_International_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Comedies_Romantic_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Crime_TV_Shows_Docuseries = table.Column<int>(type: "INTEGER", nullable: false),
                    Documentaries = table.Column<int>(type: "INTEGER", nullable: false),
                    Documentaries_International_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Docuseries = table.Column<int>(type: "INTEGER", nullable: false),
                    Dramas = table.Column<int>(type: "INTEGER", nullable: false),
                    Dramas_International_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Dramas_Romantic_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Family_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    Fantasy = table.Column<int>(type: "INTEGER", nullable: false),
                    Horror_Movies = table.Column<int>(type: "INTEGER", nullable: false),
                    International_Movies_Thrillers = table.Column<int>(type: "INTEGER", nullable: false),
                    International_TV_Shows_Romantic_TV_Shows_TV_Dramas = table.Column<int>(type: "INTEGER", nullable: false),
                    Kids_TV = table.Column<int>(type: "INTEGER", nullable: false),
                    Language_TV_Shows = table.Column<int>(type: "INTEGER", nullable: false),
                    Musicals = table.Column<int>(type: "INTEGER", nullable: false),
                    Nature_TV = table.Column<int>(type: "INTEGER", nullable: false),
                    Reality_TV = table.Column<int>(type: "INTEGER", nullable: false),
                    Spirituality = table.Column<int>(type: "INTEGER", nullable: false),
                    TV_Action = table.Column<int>(type: "INTEGER", nullable: false),
                    TV_Comedies = table.Column<int>(type: "INTEGER", nullable: false),
                    TV_Dramas = table.Column<int>(type: "INTEGER", nullable: false),
                    Talk_Shows_TV_Comedies = table.Column<int>(type: "INTEGER", nullable: false),
                    Thrillers = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_titles", x => x.show_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "movies_titles");
        }
    }
}
