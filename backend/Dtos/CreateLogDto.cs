using Microsoft.AspNetCore.Http; // IFormFile için
using System;
using System.Collections.Generic; // List için
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    // Frontend'den gelen çoklu dosyaları ve metin verilerini karşılar
    public class CreateLogDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public DateTime TravelDate { get; set; }
        
        public DateTime EntryDate { get; set; }
        
        public int Rating { get; set; }

        // YENİ: Tek dosya yerine dosya listesi alıyoruz
        // Frontend'den 'ImageFiles' adıyla gönderilecek



         public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<IFormFile> ImageFiles { get; set; } = new List<IFormFile>();

        public bool IsPublic { get; set; } 

        
    }
}