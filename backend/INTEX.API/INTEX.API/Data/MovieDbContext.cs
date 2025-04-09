using Microsoft.EntityFrameworkCore;

namespace INTEX.API.Data 
{
    public class MovieDbContext : DbContext
    {
        public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
        {}

        public DbSet<Movie> movies_titles { get; set; }
        public DbSet<MovieUser> movies_users { get; set; }
        
        public DbSet<MovieRating> movies_ratings { get; set; }
        
        public DbSet<ContentRecommendation> content_recommendations { get; set; }
        
        public DbSet<CollaborativeRecommendation> collaborative_recommendations { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Explicitly setting the primary key if it's not detected by convention
            modelBuilder.Entity<MovieUser>()
                .HasKey(u => u.UserId);  // Make sure 'UserId' is set as the primary key

            // Configure 'UserId' to auto-increment if it's not already set in the database
            modelBuilder.Entity<MovieUser>()
                .Property(u => u.UserId)
                .ValueGeneratedOnAdd();  // Auto-increment
            
            // Optionally, explicitly set show_id as the primary key
            modelBuilder.Entity<CollaborativeRecommendation>()
                .HasKey(m => m.ShowId);  // Set ShowId as the primary key
            
            // Optionally, explicitly set show_id as the primary key
            modelBuilder.Entity<ContentRecommendation>()
                .HasKey(m => m.SourceShowID);  // Set ShowId as the primary key
            
            modelBuilder.Entity<MovieRating>()
                .HasKey(m => m.ShowId);  // Set ShowId as the primary key
        }
    }
}