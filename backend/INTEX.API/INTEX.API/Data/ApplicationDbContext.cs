using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace INTEX.API.Data;

// Defines the database context for the application, inheriting from IdentityDbContext to support ASP.NET Identity features
public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    // Constructor that takes DbContext options and passes them to the base class
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // DbSet for the ContentRecommendation entity, representing the content_recommendations table
    public DbSet<ContentRecommendation> ContentRecommendations { get; set; }

    // DbSet for the Movie entity, representing the movies_titles table
    public DbSet<Movie> MoviesTitles { get; set; }

    // Configures the entity mappings and schema for the database
    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Call the base class's OnModelCreating to ensure Identity-related configurations are applied
        base.OnModelCreating(builder);

        // Configure the Movie entity
        builder.Entity<Movie>()
            // Map the Movie entity to the movies_titles table in the database
            // This ensures EF Core queries the correct table instead of the default (MoviesTitles)
            .ToTable("movies_titles")
            // Set Show_Id as the primary key for the Movie entity
            .HasKey(m => m.Show_Id);

        // Configure the ContentRecommendation entity
        builder.Entity<ContentRecommendation>()
            // Map the ContentRecommendation entity to the content_recommendations table in the database
            // This ensures EF Core queries the correct table instead of the default (ContentRecommendations)
            .ToTable("content_recommendations")
            // Specify that ContentRecommendation has no primary key, as the table is not designed with one
            .HasNoKey();
    }
}