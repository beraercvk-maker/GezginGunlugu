/* Konum: backend/Dtos/UserDto.cs */

using System;
using System.Collections.Generic; 

namespace backend.Dtos
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty; 
        public string Email { get; set; } = string.Empty; 

    public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public string? PhoneNumber { get; set; }
        public DateTime? BirthDate { get; set; }
        public IList<string> Roles { get; set; } = new List<string>(); 
        
        // YENİ: Kullanıcının ban (kilitlenme) durumunu
        // ve bitiş tarihini tutmak için eklendi.
        public DateTimeOffset? LockoutEnd { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}