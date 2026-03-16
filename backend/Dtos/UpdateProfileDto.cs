using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Ad zorunludur.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyad zorunludur.")]
        public string LastName { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz.")]
        public string? PhoneNumber { get; set; }

        public DateTime? BirthDate { get; set; }

        public IFormFile? ProfileImage { get; set; }
    }
}
