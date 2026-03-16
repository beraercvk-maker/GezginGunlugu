using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Döngüsel referansı kırmak için

namespace backend.Models
{
    public class TravelLogImage
    {
        public int Id { get; set; }

        // Resmin sunucudaki yolu (örn: /uploads/resim1.jpg)
        [Required]
        public string Url { get; set; } = string.Empty;

        // Hangi günlüğe ait olduğu
        public int TravelLogId { get; set; }

        // Navigation Property (Geriye dönük ilişki)
        [ForeignKey("TravelLogId")]
        [JsonIgnore] // API'den veri çekerken sonsuz döngüye girmesin diye
        public virtual TravelLog? TravelLog { get; set; }
    }
}
