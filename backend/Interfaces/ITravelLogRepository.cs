using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface ITravelLogRepository : IRepository<TravelLog>
    {
        // Hata almanıza neden olan eksik metot tanımı:
        Task<IEnumerable<TravelLog>> GetByUserIdAsync(string userId);

        // Resim işlemleri için gerekli metotlar:
        Task<TravelLogImage?> GetImageByIdAsync(int imageId);
        Task DeleteImageAsync(TravelLogImage image);

        Task<List<TravelLog>> GetPopularPublicLogsAsync(int count);





        // Listenin sonuna ekle:
Task<List<TravelLog>> GetAllWithDetailsAsync();
    }
}