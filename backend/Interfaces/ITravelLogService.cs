/* Konum: backend/Interfaces/ITravelLogService.cs */

using backend.Models;
using System.Collections.Generic;
using System.Security.Claims; // ClaimsPrincipal (Kullanıcının kimliği)
using System.Threading.Tasks;
using backend.Dtos; // DTO'lar için

namespace backend.Interfaces
{
    public interface ITravelLogService
    {
        // Controller bu 'user' (kimlik) bilgisini
        // [Authorize] attribute'undan (HTTP isteğinden) alıp
        // bu metoda geçirecek.
        // Bu metot, 'user' Admin ise hepsini, değilse UserId'ye göre getirecek.
        Task<IEnumerable<TravelLog>> GetAllLogsForUserAsync(ClaimsPrincipal user);

        // Kullanıcının, istediği 'id'li günlüğü görmeye
        // yetkisi olup olmadığını kontrol et
        Task<TravelLog?> GetLogByIdAsync(int id, ClaimsPrincipal user);

        // Yeni bir günlük oluştururken,
        // 'user' kimliğini kullanarak 'UserId'yi otomatik ata
        Task<TravelLog> CreateLogAsync(TravelLog newLog, ClaimsPrincipal user);

        // Sadece Admin'in veya günlüğün sahibinin
        // güncelleme yapabildiğini kontrol et
        Task<bool> UpdateLogAsync(int id, TravelLog updatedLog, ClaimsPrincipal user);

        // Sadece Admin'in veya günlüğün sahibinin
        // silme yapabildiğini kontrol et
        Task<bool> DeleteLogAsync(int id, ClaimsPrincipal user);
         Task<bool> DeleteImageAsync(int imageId, ClaimsPrincipal user);

         Task<List<TravelLogDto>> GetDiscoverLogsAsync();
    }
}