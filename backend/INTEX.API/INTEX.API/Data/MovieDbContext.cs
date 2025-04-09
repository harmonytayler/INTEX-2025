using Microsoft.EntityFrameworkCore;

namespace INTEX.API.Data;

public class MovieDbContext : DbContext
{
    public MovieDbContext(DbContextOptions<MovieDbContext> options)
        : base(options)
    {
        // Ensure database and tables are created
        Database.EnsureCreated();
    }

    public DbSet<MovieUser> movies_users { get; set; }
    public DbSet<Movie> movies_titles { get; set; }
    
    public DbSet<MovieRating> movies_ratings { get; set; }

    public DbSet<ContentRecommendation> content_recommendations { get; set; }

    public DbSet<CollaborativeRecommendation> collaborative_recommendations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MovieUser>(entity =>
        {
            entity.ToTable("movies_users");
            entity.HasKey(e => e.UserId);
            
            // Configure SQLite auto-incrementing
            entity.Property(e => e.UserId)
                .ValueGeneratedOnAdd()
                .HasColumnType("INTEGER");
            
            // Configure string length constraints
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.State).HasMaxLength(50);
        });

        modelBuilder.Entity<Movie>(entity =>
        {
            entity.ToTable("movies_titles");
            entity.HasKey(e => e.ShowId);
            
            // Configure required fields
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.Title).IsRequired();
        });
        
        
        // Optionally, explicitly set show_id as the primary key
        modelBuilder.Entity<CollaborativeRecommendation>()
            .HasKey(m => m.ShowId);  // Set ShowId as the primary key

        // Optionally, explicitly set show_id as the primary key
        modelBuilder.Entity<ContentRecommendation>()
            .HasKey(m => m.SourceShowID);  // Set ShowId as the primary key

        modelBuilder.Entity<MovieRating>()
            .HasKey(m => new { m.UserId, m.ShowId });  // Set composite key for UserId and ShowId
        
        
    }
}