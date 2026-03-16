using backend.Models; // 1. Adımda oluşturduğumuz Model'i kullan
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace backend.Data
{
    
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<TravelLog> TravelLogs { get; set; }
        public DbSet<TravelLogImage> TravelLogImages { get; set; }
    }
}
