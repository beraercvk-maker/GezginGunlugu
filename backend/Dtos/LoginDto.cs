using System.ComponentModel.DataAnnotations; // [Required], [EmailAddress] gibi doğrulamalar için

namespace backend.Dtos
{
    // Frontend'den giriş yaparken gönderilecek verinin yapısı
    public class LoginDto
    {
        [Required(ErrorMessage = "E-posta adresi gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre gereklidir.")]
        public string Password { get; set; } = string.Empty;
    }
}