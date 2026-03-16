using backend.Interfaces;
using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Hosting;
using System.IO;


namespace backend.Services
{
    public class TravelLogService : ITravelLogService
    {
        private readonly ITravelLogRepository _travelLogRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _environment;
        
        // _context ARTIK YOK. (Repository kullanıyoruz)

        public TravelLogService(
            ITravelLogRepository travelLogRepository,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment environment)
        {
            _travelLogRepository = travelLogRepository;
            _userManager = userManager;
            _environment = environment;
        }

        // --- ID ALMA METODU ---
        private string? GetUserId(ClaimsPrincipal user)
        {
            if (user == null) return null;
            var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(id)) return id;
            id = user.FindFirstValue("sub");
            if (!string.IsNullOrEmpty(id)) return id;
            var idClaim = user.Claims.FirstOrDefault(c =>
                c.Type.Equals(ClaimTypes.NameIdentifier, StringComparison.OrdinalIgnoreCase) ||
                c.Type.Equals("sub", StringComparison.OrdinalIgnoreCase) ||
                c.Type.Equals("id", StringComparison.OrdinalIgnoreCase));
            if (idClaim != null && !string.IsNullOrEmpty(idClaim.Value)) return idClaim.Value;
            try { id = _userManager.GetUserId(user); if (!string.IsNullOrEmpty(id)) return id; } catch { }
            return null;
        }

        public async Task<TravelLog> CreateLogAsync(TravelLog newLog, ClaimsPrincipal user)
        {
            var userId = GetUserId(user);
            if (string.IsNullOrEmpty(userId)) throw new Exception($"Kullanıcı kimliği belirlenemedi.");

            newLog.UserId = userId;
            newLog.CreatedAt = DateTime.UtcNow;
            newLog.UpdatedAt = DateTime.UtcNow;
            
            // IsPublic zaten controller'dan gelen newLog içinde dolu geliyor, ek işleme gerek yok.

            await _travelLogRepository.AddAsync(newLog);
            return newLog;
        }

       public async Task<IEnumerable<TravelLog>> GetAllLogsForUserAsync(ClaimsPrincipal user)
{
    // EĞER ADMİN İSE: Özel yazdığımız "Full Detaylı ve Sıralı" metodu çağır
    if (user.IsInRole("Admin"))
    {
        return await _travelLogRepository.GetAllWithDetailsAsync();
    }
    
    // EĞER NORMAL KULLANICI İSE: Sadece kendininkileri görsün
    var userId = GetUserId(user);
    if (string.IsNullOrEmpty(userId)) return Enumerable.Empty<TravelLog>();
    
    return await _travelLogRepository.GetByUserIdAsync(userId);
}

        public async Task<TravelLog?> GetLogByIdAsync(int id, ClaimsPrincipal user)
        {
            var log = await _travelLogRepository.GetByIdAsync(id);
            if (log == null) return null;

            var userId = GetUserId(user);
            bool isOwner = !string.IsNullOrEmpty(userId) && string.Equals(log.UserId, userId, StringComparison.OrdinalIgnoreCase);

            // Eğer Admin ise, Sahibi ise VEYA Herkese Açıksa (IsPublic) göster
            if (user.IsInRole("Admin") || isOwner || log.IsPublic)
            {
                return log;
            }
            return null;
        }

        public async Task<bool> UpdateLogAsync(int id, TravelLog updatedLog, ClaimsPrincipal user)
        {
            var existingLog = await _travelLogRepository.GetByIdAsync(id);
            if (existingLog == null) return false;

            var userId = GetUserId(user);
            bool isOwner = !string.IsNullOrEmpty(userId) && string.Equals(existingLog.UserId, userId, StringComparison.OrdinalIgnoreCase);

            if (!user.IsInRole("Admin") && !isOwner) return false;

            existingLog.Title = updatedLog.Title;
            existingLog.Content = updatedLog.Content;
            existingLog.Location = updatedLog.Location;
            existingLog.TravelDate = updatedLog.TravelDate;
            existingLog.Rating = updatedLog.Rating;
            existingLog.IsPublic = updatedLog.IsPublic; // Güncelleme sırasında da değiştirilebilsin
            existingLog.Latitude = updatedLog.Latitude;
            existingLog.Longitude = updatedLog.Longitude;
            existingLog.UpdatedAt = DateTime.UtcNow;

            await _travelLogRepository.UpdateAsync(existingLog);
            return true;
        }

        public async Task<bool> DeleteLogAsync(int id, ClaimsPrincipal user)
        {
            var existingLog = await _travelLogRepository.GetByIdAsync(id);
            if (existingLog == null) return false;
            var userId = GetUserId(user);
            bool isOwner = !string.IsNullOrEmpty(userId) && string.Equals(existingLog.UserId, userId, StringComparison.OrdinalIgnoreCase);
            if (!user.IsInRole("Admin") && !isOwner) return false;
            await _travelLogRepository.DeleteAsync(existingLog);
            return true;
        }

        public async Task<bool> DeleteImageAsync(int imageId, ClaimsPrincipal user)
        {
            var image = await _travelLogRepository.GetImageByIdAsync(imageId);
            if (image == null) return false;
            var userId = GetUserId(user);
            if (image.TravelLog != null)
            {
                bool isOwner = !string.IsNullOrEmpty(userId) && string.Equals(image.TravelLog.UserId, userId, StringComparison.OrdinalIgnoreCase);
                if (!user.IsInRole("Admin") && !isOwner) return false;
            }
            try
            {
                string relativePath = image.Url.TrimStart('/');
                string fullPath = Path.Combine(_environment.WebRootPath, relativePath);
                if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
            }
            catch { }
            await _travelLogRepository.DeleteImageAsync(image);
            return true;
        }

        // --- KEŞFET METODU (ARTIK REPOSITORY KULLANIYOR) ---
        public async Task<List<TravelLogDto>> GetDiscoverLogsAsync()
        {
            // Repository'e "Bana 50 tane getir" diyoruz
            var logs = await _travelLogRepository.GetPopularPublicLogsAsync(50);

            // Gelen veriyi DTO'ya çeviriyoruz
            return logs.Select(log => new TravelLogDto
            {
                Id = log.Id,
                Title = log.Title,
                Content = log.Content,
                TravelDate = log.TravelDate,
                Location = log.Location,
                Images = log.Images.Select(i => new TravelLogImageDto { Id = i.Id, Url = i.Url }).ToList(),
                UserName = log.User != null ? $"{log.User.FirstName} {log.User.LastName}" : "Gezgin",
                UserId = log.UserId
            }).ToList();
        }
    }
}