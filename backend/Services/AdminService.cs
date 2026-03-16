/* Konum: backend/Services/AdminService.cs */

using backend.Dtos; // UserDto, BanUserDto, UpdateRoleDto
using backend.Interfaces; // IAdminService
using backend.Models; // ApplicationUser
using backend.Data; // AppDbContext EKLENDİ (Veritabanı erişimi için)
using Microsoft.AspNetCore.Identity; // UserManager, RoleManager, IdentityResult, IdentityError
using Microsoft.EntityFrameworkCore; // ToListAsync, RemoveRange
using System.Collections.Generic;
using System.Linq; // Select, Where, Any
using System.Threading.Tasks;
using System; // DateTimeOffset
using Microsoft.AspNetCore.Http; // IHttpContextAccessor

namespace backend.Services
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        // 1. Veritabanı Context'ini Ekliyoruz
        private readonly AppDbContext _context; 

        public AdminService(
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager,
            IHttpContextAccessor httpContextAccessor,
            AppDbContext context) // Constructor'a context parametresini ekledik
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _httpContextAccessor = httpContextAccessor;
            _context = context; // Context'i atadık
        }

        // 1. Tüm Kullanıcıları Listeleme Metodu
        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName, // Eğer ApplicationUser'da varsa
                    LastName = user.LastName,   // Eğer ApplicationUser'da varsa
                    PhoneNumber = user.PhoneNumber,
                    BirthDate = user.BirthDate,
                    Roles = await _userManager.GetRolesAsync(user),
                    LockoutEnd = user.LockoutEnd 
                };
                userDtos.Add(userDto);
            }
            return userDtos;
        }

        // 2. Kullanıcı Silme Metodu (GÜNCELLENDİ - HATA ÇÖZÜMÜ)
        public async Task<IdentityResult> DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });
            }

            // --- KRİTİK DÜZELTME BAŞLANGICI ---
            // Kullanıcıyı silmeden önce ona ait TravelLogs (Günlükler) var mı diye bakıyoruz.
            // Eğer varsa, önce onları siliyoruz ki SQL "Foreign Key" hatası vermesin.
            var userLogs = _context.TravelLogs.Where(x => x.UserId == userId).ToList();
            
            if (userLogs.Any())
            {
                _context.TravelLogs.RemoveRange(userLogs); // Toplu silme
                await _context.SaveChangesAsync(); // Veritabanına kaydet
            }
            // --- KRİTİK DÜZELTME BİTİŞİ ---

            // Artık kullanıcıyı güvenle silebiliriz
            return await _userManager.DeleteAsync(user);
        }

        // 3. Kullanıcı Banlama Metodu
        public async Task<IdentityResult> BanUserAsync(string userId, BanUserDto banUserDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });
            }
            return await _userManager.SetLockoutEndDateAsync(user, banUserDto.LockoutEndDate);
        }

        // 4. Kullanıcı Rolünü Güncelleme Metodu
        public async Task<IdentityResult> UpdateUserRoleAsync(string userId, UpdateRoleDto updateRoleDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });
            }

            var roleExists = await _roleManager.RoleExistsAsync(updateRoleDto.RoleName);
            if (!roleExists)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Belirtilen rol bulunamadı." });
            }

            var httpUser = _httpContextAccessor.HttpContext?.User; 
            if (httpUser == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "İsteği yapan kullanıcı belirlenemedi." });
            }
            
            var currentUserId = _userManager.GetUserId(httpUser);

            if (user.Id == currentUserId && updateRoleDto.RoleName != "Admin")
            {
                return IdentityResult.Failed(new IdentityError { Description = "Admin kendi rolünü düşüremez." });
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcının mevcut rolleri kaldırılırken bir hata oluştu." });
            }

            var addResult = await _userManager.AddToRoleAsync(user, updateRoleDto.RoleName);
            return addResult;
        }
        // backend/Services/AdminService.cs içine en alta ekle:

public async Task<DashboardStatsDto> GetDashboardStatsAsync()
{
    // Kullanıcı sayısını UserManager'dan al
    var totalUsers = await _userManager.Users.CountAsync();
    
    // Günlük sayısını Context'ten al (Not: _context yoksa constructor'da inject etmelisin)
    var totalLogs = await _context.TravelLogs.CountAsync();

    return new DashboardStatsDto
    {
        TotalUsers = totalUsers,
        TotalLogs = totalLogs
    };
}
    }
}