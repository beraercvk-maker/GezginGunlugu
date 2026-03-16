using System;
using System.Collections.Generic; 
using System.ComponentModel.DataAnnotations; 
using System.ComponentModel.DataAnnotations.Schema; 
using backend.Models; 

namespace backend.Models
{
    public class TravelLog
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Baslik giriniz")]
        public string? Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "konum giriniz")]
        public string? Location { get; set; } = string.Empty;

        // --- YENİ: Harita Koordinatları ---
   
        public double? Latitude { get; set; }  // Enlem 
        public double? Longitude { get; set; } // Boylam 

        public virtual ICollection<TravelLogImage> Images { get; set; } = new List<TravelLogImage>();

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        [Required(ErrorMessage = "metin giriniz")]
        public string? Content { get; set; } = string.Empty;

        public DateTime TravelDate { get; set; }

        [Required(ErrorMessage = "giris tarihini giriniz")]
        public DateTime EntryDate { get; set; }

        [Range(1, 5, ErrorMessage = "1 ve 5 arasinda puanlayin")]
        public int? Rating { get; set; }

        // UserId
        public string? UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }


        public List<Comment> Comments { get; set; }
    public List<Like> Likes { get; set; }

        public bool IsPublic { get; set; } = false; // Varsayılan olarak özel
        
           
    }
}