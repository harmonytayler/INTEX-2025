using Microsoft.EntityFrameworkCore;

namespace INTEX.API.Data 
{
    public class TestDbContext : DbContext
    {
        public TestDbContext(DbContextOptions<TestDbContext> options) : base(options)
        {}

        public DbSet<TestItem> TestItems { get; set; }
    }
}