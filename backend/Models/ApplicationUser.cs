/* Konum: backend/Models/ApplicationUser.cs */

using Microsoft.AspNetCore.Identity;
using System; 

namespace backend.Models
{
    
    public class ApplicationUser : IdentityUser
    {
        // YENİ: Ad ve Soyad alanlarını ekliyoruz
        // (string? -> Bu alanların "null" (boş) olmasına izin ver demektir)
        // (Ancak RegisterDto'da [Required] yaparak zorunlu hale getireceğiz)
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        // Bu alan zaten vardı
        public DateTime BirthDate { get; set; }
        public string? ProfileImageUrl { get; set; }

        public string? RegistrationIp { get; set; }
    }
}