using backend.Dtos;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.WebUtilities; // Token encode/decode için gerekli

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IWebHostEnvironment _environment;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            RoleManager<IdentityRole> roleManager,
            IWebHostEnvironment environment,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _roleManager = roleManager;
            _environment = environment;
            _emailService = emailService;
        }

        // --- 1. KAYIT OLMA METODU ---
     public async Task<IdentityResult> RegisterUserAsync(RegisterDto registerDto, string ipAddress)
{
    var user = new ApplicationUser
    {
        UserName = registerDto.Email,
        Email = registerDto.Email,
        PhoneNumber = registerDto.PhoneNumber,
        
        // Eğer DTO'da string geliyorsa DateTime.Parse() gerekebilir, 
        // senin kodunda direkt atama vardı, öyle bırakıyorum:
        BirthDate = registerDto.BirthDate, 
        
        FirstName = registerDto.FirstName,
        LastName = registerDto.LastName,
        EmailConfirmed = false,
        
        // --- YENİ EKLENEN: IP ADRESİ KAYDI ---
        RegistrationIp = ipAddress
        // -------------------------------------
    };

    var result = await _userManager.CreateAsync(user, registerDto.Password);

    if (result.Succeeded)
    {
        await _userManager.AddToRoleAsync(user, "User");

        // 1. Kodu Üret
        Random generator = new Random();
        String verificationCode = generator.Next(0, 1000000).ToString("D6");

        // YEDEK: Konsola yaz (Test için)
        Console.WriteLine("**********************************************");
        Console.WriteLine($"----> KONSOL KODU: {verificationCode} <----");
        Console.WriteLine("**********************************************");

        // 2. Kodu Veritabanına Kaydet (Identity User Token Tablosuna)
        await _userManager.SetAuthenticationTokenAsync(user, "Default", "EmailVerification", verificationCode);

        // 3. Mail Gönder
        try
        {
            var body = $"<h1>Doğrulama Kodunuz: {verificationCode}</h1>";
            await _emailService.SendEmailAsync(user.Email, "Gezgin Günlüğü Kod", body);
        }
        catch (Exception)
        {
            Console.WriteLine("Mail gönderilemedi, ancak kayıt devam ediyor.");
        }
    }

    return result;
}

        // --- 2. KOD DOĞRULAMA METODU ---
        public async Task<bool> VerifyEmailCodeAsync(string email, string code)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return false;

            var storedCode = await _userManager.GetAuthenticationTokenAsync(user, "Default", "EmailVerification");

            if (storedCode == code)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
                await _userManager.RemoveAuthenticationTokenAsync(user, "Default", "EmailVerification");
                return true;
            }
            return false;
        }

        // --- 3. GİRİŞ YAPMA METODU ---
        public async Task<string?> LoginUserAsync(LoginDto loginDto)
        {
            var normalizedEmail = _userManager.NormalizeEmail(loginDto.Email);
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

            if (user == null) return null;

            if (!await _userManager.IsEmailConfirmedAsync(user)) return null;

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: true);
            if (!result.Succeeded) return null;

            var userRoles = await _userManager.GetRolesAsync(user);
            return GenerateJwtToken(user, userRoles);
        }

        // --- JWT TOKEN ÜRETİCİ ---
        // AuthService.cs dosyasının en altındaki bu metodu bul ve bununla değiştir:



private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
{
    var claims = new List<Claim>
    {
        // 1. Kimlik Numaraları (Burası tamamdı)
        new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
        new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

        
        // Navbar'da ismin görünmesi için ,
        new Claim(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
        new Claim(ClaimTypes.Surname, user.LastName ?? string.Empty),
        // --------------------------------------------------------
    };

    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }

    var jwtKey = _configuration["Jwt:Key"];
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    
    
    var expires = DateTime.UtcNow.AddDays(7);// Token süresi 7 gün

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: expires,
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

        // --- UPDATE PROFILE ---
        public async Task<(bool Success, string Message)> UpdateProfileAsync(string userId, UpdateProfileDto updateProfileDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (false, "Kullanıcı bulunamadı.");
            
            user.FirstName = updateProfileDto.FirstName;
            user.LastName = updateProfileDto.LastName;
            user.PhoneNumber = updateProfileDto.PhoneNumber;
            if (updateProfileDto.BirthDate.HasValue) user.BirthDate = updateProfileDto.BirthDate.Value;

            if (updateProfileDto.ProfileImage != null && updateProfileDto.ProfileImage.Length > 0)
            {
                try
                {
                    string webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    string uploadsFolder = Path.Combine(webRootPath, "uploads", "profiles");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                    
                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(updateProfileDto.ProfileImage.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await updateProfileDto.ProfileImage.CopyToAsync(fileStream);
                    }
                    
                    if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                    {
                        var oldPath = Path.Combine(webRootPath, user.ProfileImageUrl.TrimStart('/', '\\').Replace("/", "\\"));
                        if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
                    }
                    user.ProfileImageUrl = "/uploads/profiles/" + uniqueFileName;
                }
                catch (Exception ex) { return (false, "Resim hatası: " + ex.Message); }
            }
            
            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded) return (true, user.ProfileImageUrl);
            return (false, result.Errors.FirstOrDefault()?.Description ?? "Hata.");
        }

        // --- CHANGE PASSWORD (LOGGED IN) ---
        public async Task<IdentityResult> ChangeProfileAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });
            return await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
        }

        // --- GET PROFILE ---
        public async Task<UserDto?> GetProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                BirthDate = user.BirthDate,
                Roles = await _userManager.GetRolesAsync(user),
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        // --- 4. ŞİFREMİ UNUTTUM (FORGOT PASSWORD) ---
        // Kullanıcıya şifre sıfırlama linki gönderir.
        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            // Güvenlik gereği kullanıcı yoksa bile hata dönmüyoruz (Enumeration Attack önlemi)
            if (user == null) return true;

            // 1. Token Üret
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // 2. Token URL içinde bozulmasın diye Encode et (+, /, = karakterlerini temizler)
            var tokenBytes = Encoding.UTF8.GetBytes(token);
            var encodedToken = WebEncoders.Base64UrlEncode(tokenBytes);

            // 3. React Frontend Linkini Hazırla
            // Kullanıcı bu linke tıkladığında React'teki ResetPassword sayfasına gidecek
            var clientUrl = "http://localhost:5173"; 
            var link = $"{clientUrl}/reset-password?email={email}&token={encodedToken}";

            var body = $"<h1>Şifre Sıfırlama</h1>" +
                       $"<p>Merhaba {user.FirstName},</p>" +
                       $"<p>Şifrenizi yenilemek için lütfen aşağıdaki linke tıklayın:</p>" +
                       $"<a href='{link}' style='padding:10px; background-color:blue; color:white; text-decoration:none; border-radius:5px;'>Şifremi Yenile</a>";

            try
            {
                await _emailService.SendEmailAsync(email, "Şifre Sıfırlama Talebi", body);
                return true;
            }
            catch
            {
                return false;
            }
        }

        // --- 5. ŞİFRE SIFIRLAMA (RESET PASSWORD) ---
        // Linkten gelen token ve yeni şifre ile işlemi tamamlar.
        public async Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null)
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });

            try
            {
                // Token'ı eski haline çevir (Decode)
                var tokenBytes = WebEncoders.Base64UrlDecode(resetPasswordDto.Token);
                var decodedToken = Encoding.UTF8.GetString(tokenBytes);

                // Şifreyi güncelle
                return await _userManager.ResetPasswordAsync(user, decodedToken, resetPasswordDto.NewPassword);
            }
            catch
            {
                return IdentityResult.Failed(new IdentityError { Description = "Geçersiz veya bozuk token." });
            }
        }
        // --- EMAIL LINK DOĞRULAMA (Bu metot eksik olduğu için hata veriyordu) ---
        public async Task<IdentityResult> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) 
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });

            try
            {
                // Token URL içinde bozulmasın diye Base64UrlDecode yapıyoruz
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
                
                return await _userManager.ConfirmEmailAsync(user, decodedToken);
            }
            catch
            {
                return IdentityResult.Failed(new IdentityError { Description = "Geçersiz token." });
            }
        }
    }
}