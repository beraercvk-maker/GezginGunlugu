/* Konum: backend/Dtos/RegisterDto.cs */

using System;
using System.ComponentModel.DataAnnotations; // [Required] vb. için

namespace backend.Dtos
{
    // Frontend'den /api/auth/register endpoint'ine gönderilecek veriyi temsil eder
    public class RegisterDto
    {
        // --- 1. YENİ: Ad ve Soyad alanları ---
        [Required(ErrorMessage = "Ad zorunludur.")]
        [StringLength(50, ErrorMessage = "Ad 50 karakterden uzun olamaz.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyad zorunludur.")]
        [StringLength(50, ErrorMessage = "Soyad 50 karakterden uzun olamaz.")]
        public string LastName { get; set; } = string.Empty;
        // ------------------------------------

        [Required(ErrorMessage = "E-posta adresi zorunludur.")]
        [EmailAddress(ErrorMessage = "Lütfen geçerli bir e-posta adresi girin.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Doğum tarihi zorunludur.")]
        [DataType(DataType.Date)]
        public DateTime BirthDate { get; set; }

        [Required(ErrorMessage = "Telefon numarası zorunludur.")]
        [Phone(ErrorMessage = "Lütfen geçerli bir telefon numarası girin.")]
        public string PhoneNumber { get; set; } = string.Empty;

        // KVKK metni onayı
        [Range(typeof(bool), "true", "true", ErrorMessage = "Kayıt olmak için KVKK metnini onaylamanız gerekmektedir.")]
        public bool HasAgreedToKvkk { get; set; }
    }
}