using backend.Dtos; 
using Microsoft.AspNetCore.Identity; 
using System.Threading.Tasks;

namespace backend.Interfaces
{
    // Bu interface, kimlik doğrulama işlemleri için metotları tanımlar.
    public interface IAuthService
    {
        // Kullanıcı Kaydı
        Task<IdentityResult> RegisterUserAsync(RegisterDto registerDto, string ipAddress);

        // Kullanıcı Girişi
        Task<string?> LoginUserAsync(LoginDto loginDto);

        // --- DEĞİŞTİRİLEN KISIM ---
        // Profil Güncelleme: IdentityResult yerine (bool, string) dönüyoruz.
        // Başarılıysa: (true, "yeni_resim_url")
        // Başarısızsa: (false, "hata_mesajı")
        Task<(bool Success, string Message)> UpdateProfileAsync(string userId, UpdateProfileDto updateProfileDto);

        // Şifre Değiştirme
        Task<IdentityResult> ChangeProfileAsync(string userId, ChangePasswordDto changePasswordDto);

        // Profil Bilgilerini Getirme
        Task<UserDto?> GetProfileAsync(string userId);
        Task<IdentityResult> ConfirmEmailAsync(string userId, string token);
        Task<bool> VerifyEmailCodeAsync(string email, string code);
        Task<bool>ForgotPasswordAsync(string email);
        Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);

        
    }
}