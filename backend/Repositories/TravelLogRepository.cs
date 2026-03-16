using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore; 
using System.Collections.Generic;
using System.Linq; 
using System.Threading.Tasks;

namespace backend.Repositories
{
    public class TravelLogRepository : Repository<TravelLog>, ITravelLogRepository
    {
        public TravelLogRepository(AppDbContext context) : base(context)
        {
        }

        // 1. Tüm günlükleri getir (Resimler + Kullanıcı Dahil)
        public override async Task<IEnumerable<TravelLog>> GetAllAsync()
        {
            return await _dbSet
                .Include(l => l.Images) 
                .Include(l => l.User) // YENİ: Yazarı da getir
                .OrderByDescending(l => l.TravelDate)
                .ToListAsync();
        }

        // 2. Tek günlük getir (Resimler + Kullanıcı Dahil)
        public override async Task<TravelLog?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(l => l.Images) 
                .Include(l => l.User) // YENİ: Yazarı da getir
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        // 3. Kullanıcıya özel (Resimler + Kullanıcı Dahil)
        public async Task<IEnumerable<TravelLog>> GetByUserIdAsync(string userId)
        {
            return await _dbSet
                .Where(log => log.UserId == userId)
                .Include(l => l.Images) 
                .Include(l => l.User) // YENİ: Yazarı da getir
                .OrderByDescending(l => l.TravelDate)
                .ToListAsync();
        }

        public async Task<TravelLogImage?> GetImageByIdAsync(int imageId)
        {
            return await _context.TravelLogImages
                .Include(img => img.TravelLog)
                .FirstOrDefaultAsync(img => img.Id == imageId);
        }

        public async Task DeleteImageAsync(TravelLogImage image)
        {
            _context.TravelLogImages.Remove(image);
            await _context.SaveChangesAsync();
        }


        // Sınıfın içine ekle:
public async Task<List<TravelLog>> GetPopularPublicLogsAsync(int count)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            return await _context.TravelLogs
                .Include(t => t.Images)
                .Include(t => t.User)
                .Include(t => t.Likes)
                .Where(t => t.IsPublic == true)
                .OrderByDescending(t => t.Likes.Count(l => l.LikeDate >= oneWeekAgo))
                .ThenByDescending(t => t.TravelDate)
                .Take(count) // Parametreyi burada kullanıyoruz
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
        // Bu fonksiyonu TravelLogRepository sınıfının içine ekle:

public async Task<List<TravelLog>> GetAllWithDetailsAsync()
{
    return await _context.TravelLogs
        .Include(t => t.Images) // Resimleri getir
        .Include(t => t.User)   // Yazarı getir
        .OrderByDescending(t => t.Id) // En son eklenen en üstte olsun (ID'si en büyük olan)
        .ToListAsync();
}
    }
}