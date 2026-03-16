using System;

namespace backend.Models // BURAYA DİKKAT: TravelLog.cs'in namespace'i neyse onu yaz! (Örn: backend.Entities de olabilir)
{
    public class Comment
    {
        public int Id { get; set; } // BaseEntity yoksa Id'yi elle ekleyelim
        public string Content { get; set; } 
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Hangi gezi yazısına ait?
        public int TravelLogId { get; set; }
        public TravelLog TravelLog { get; set; } // Hata verirse TravelLog adını kontrol et

        // Kim yazdı?
        public string UserId { get; set; }
        // Eğer IdentityUser kullanıyorsan buradaki tip 'AppUser' veya 'IdentityUser' olabilir.
        // Projende AppUser.cs varsa AppUser yaz, yoksa IdentityUser yaz.
        public ApplicationUser User { get; set; } 
    }
}