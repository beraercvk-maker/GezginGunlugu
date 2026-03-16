using backend.Dtos; 
using backend.Interfaces; 
using Microsoft.AspNetCore.Identity; 
using Microsoft.AspNetCore.Mvc; 
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims; 
using System.Linq; // Split ve LastOrDefault işlemleri için gerekli
using System.Collections.Generic;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // 1. Kayıt Ol (Domain Kontrolü Eklendi)
        [HttpPost("register")]
public async Task<IActionResult> Register(RegisterDto registerDto)
{
    // --- DOMAIN KONTROLÜ ---
    var allowedDomains = new List<string> { "gmail.com", "hotmail.com", "outlook.com" };

    if (string.IsNullOrEmpty(registerDto.Email))
    {
        return BadRequest(new { Message = "E-posta adresi gereklidir." });
    }
    
    var emailDomain = registerDto.Email.Split('@').LastOrDefault()?.ToLower();

    if (emailDomain == null || !allowedDomains.Contains(emailDomain))
    {
        return BadRequest(new { 
            Message = "Güvenlik nedeniyle sadece Gmail, Hotmail ve Outlook uzantılı e-postalar kabul edilmektedir." 
        });
    }
    // -----------------------

    if (!ModelState.IsValid) return BadRequest(ModelState);
    
    // --- YENİ: IP ADRESİNİ YAKALAMA ---
    // Kullanıcının IP adresini alıyoruz. (Localhost'ta ::1 gelebilir, sunucuda gerçek IP gelir)
    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
    // ----------------------------------

    // --- GÜNCELLEME: Servise IP adresini de gönderiyoruz ---
    var result = await _authService.RegisterUserAsync(registerDto, ipAddress);

    if (result.Succeeded)
    {
        return Ok(new { Message = "Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama kodunu giriniz." });
    }

    foreach (var error in result.Errors)
    {
        ModelState.AddModelError(error.Code, error.Description);
    }
    return BadRequest(ModelState);
}

        // --- E-posta Doğrulama Endpoint'i (Link ile) ---
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("Geçersiz istek.");

            var result = await _authService.ConfirmEmailAsync(userId, token);

            if (result.Succeeded)
            {
                return Ok(new { Message = "E-posta başarıyla doğrulandı! Artık giriş yapabilirsiniz." });
            }

            return BadRequest("E-posta doğrulanamadı. Link geçersiz veya süresi dolmuş.");
        }

        // 2. Giriş Yap
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var token = await _authService.LoginUserAsync(loginDto);

            if (token != null)
            {
                return Ok(new { Token = token });
            }

            // Token null geldiyse ya şifre yanlış ya da e-posta onaylanmamış
            return Unauthorized(new { Message = "Giriş başarısız. Lütfen şifrenizi kontrol edin veya e-postanızı doğruladığınızdan emin olun." });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "Kullanıcı kimliği bulunamadı." });
            var userDto = await _authService.GetProfileAsync(userId);
            if (userDto == null) return NotFound(new { Message = "Kullanıcı bulunamadı." });
            return Ok(userDto);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto updateProfileDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "Kullanıcı kimliği bulunamadı." });
            var result = await _authService.UpdateProfileAsync(userId, updateProfileDto);
            if (result.Success) return Ok(new { Message = "Profil bilgileri başarıyla güncellendi.", ProfileImageUrl = result.Message });
            return BadRequest(new { Message = result.Message });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "Kullanıcı kimliği bulunamadı." });
            var result = await _authService.ChangeProfileAsync(userId, changePasswordDto);
            if (result.Succeeded) return Ok(new { Message = "Şifre başarıyla değiştirildi." });
            foreach (var error in result.Errors) ModelState.AddModelError(error.Code, error.Description);
            return BadRequest(ModelState);
        }

        // --- Kod ile Doğrulama ---
        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDto verifyDto)
        {
            var isVerified = await _authService.VerifyEmailCodeAsync(verifyDto.Email, verifyDto.Code);

            if (isVerified)
            {
                return Ok(new { Message = "Hesap başarıyla doğrulandı. Şimdi giriş yapabilirsiniz." });
            }

            return BadRequest(new { Message = "Doğrulama kodu hatalı veya süresi dolmuş." });
        }

        // --- Şifremi Unuttum (Mail İsteği) ---
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            if (string.IsNullOrEmpty(forgotPasswordDto.Email)) 
                return BadRequest("E-posta adresi gereklidir.");

            var result = await _authService.ForgotPasswordAsync(forgotPasswordDto.Email);

            if (result)
            {
                return Ok(new { Message = "Eğer bu adrese kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilmiştir." });
            }

            return BadRequest("Mail gönderilirken bir hata oluştu.");
        }

        // --- Şifre Yenileme (Linke tıklandıktan sonra) ---
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _authService.ResetPasswordAsync(resetPasswordDto);

            if (result.Succeeded)
            {
                return Ok(new { Message = "Şifreniz başarıyla yenilendi. Yeni şifrenizle giriş yapabilirsiniz." });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return BadRequest(ModelState);
        }
    }
}