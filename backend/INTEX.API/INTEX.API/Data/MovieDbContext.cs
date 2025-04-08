using Microsoft.EntityFrameworkCore;

namespace INTEX.API.Data 
{
    public class MovieDbContext : DbContext
    {
        public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
        {}

        public DbSet<Movie> movies_titles { get; set; }
    }
}