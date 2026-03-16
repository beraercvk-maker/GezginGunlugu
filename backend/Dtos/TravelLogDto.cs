using System;
using System.Collections.Generic;

namespace backend.Dtos
{
    public class TravelLogDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime TravelDate { get; set; }
        public string Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        // Kullanıcı bilgileri
        public string UserId { get; set; }
        public string UserName { get; set; }
        
        // Yeni özellikler
        public bool IsPublic { get; set; }
        
        // Resim listesi (Yukarıdaki dosyayı kullanır)
        public List<TravelLogImageDto> Images { get; set; }
    }
}