using backend.Interfaces; 
using backend.Models;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Hosting; 
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic; 
using System.IO; 
using System.Linq; 
using System.Threading.Tasks;
using backend.Dtos; // Eğer DTO'lar ayrı klasördeyse
// System.Text.Json kütüphanesini manuel işlem için kullanacağız

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class TravelLogsController : ControllerBase
    {
        private readonly ITravelLogService _travelLogService;
        private readonly IWebHostEnvironment _environment;

        public TravelLogsController(ITravelLogService travelLogService, IWebHostEnvironment environment)
        {
            _travelLogService = travelLogService;
            _environment = environment;
        }

        // 1. GET (Tümü)
        [HttpGet]
        public async Task<IActionResult> GetTravelLogs()
        {
            var logs = await _travelLogService.GetAllLogsForUserAsync(this.User);
            return Ok(logs);
        }

        // 2. GET (ID'ye göre Tekil) - MANUEL JSON MODU (Donma Sorununu Çözer)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTravelLog(int id)
        {
            Console.WriteLine($"------------------------------------------");
            Console.WriteLine($"[1] İSTEK BAŞLADI. ID: {id}");

            try 
            {
                var log = await _travelLogService.GetLogByIdAsync(id, this.User);

                if (log == null) 
                {
                    Console.WriteLine($"[!] Log bulunamadı.");
                    return NotFound("Günlük bulunamadı.");
                }

                Console.WriteLine($"[2] Veri çekildi: {log.Title}");

                // DTO Haritalama
                var logDto = new LogDetailDto
                {
                    Id = log.Id,
                    Title = log.Title ?? "",
                    Content = log.Content ?? "",
                    Location = log.Location ?? "",
                    TravelDate = log.TravelDate,
                    EntryDate = log.EntryDate,
                    Rating = Convert.ToInt32(log.Rating),
                    Latitude = log.Latitude,
                    Longitude = log.Longitude,
                    UserName = log.User?.UserName ?? "Bilinmiyor",
                    
                    // LogImageDto hatası burada çözülmüş oluyor çünkü sınıfı aşağıya ekledik
                    Images = log.Images?.Select(img => new LogImageDto { Id = img.Id, Url = img.Url }).ToList() ?? new List<LogImageDto>()
                };

                Console.WriteLine($"[3] DTO Hazırlandı. Şimdi JSON'a çevriliyor...");

                // --- MANUEL SERİLEŞTİRME (Hata Ayıklama İçin) ---
                var jsonOptions = new System.Text.Json.JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase, 
                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                };

                string jsonString = System.Text.Json.JsonSerializer.Serialize(logDto, jsonOptions);

                Console.WriteLine($"[4] JSON Çevrimi BAŞARILI! Karakter uzunluğu: {jsonString.Length}");
                Console.WriteLine($"[5] Cevap gönderiliyor...");

                return Content(jsonString, "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"------------------------------------------");
                Console.WriteLine($"[KRİTİK HATA!] JSON Oluşturulurken patladı!");
                Console.WriteLine($"Hata Mesajı: {ex.Message}");
                Console.WriteLine($"Detay: {ex.InnerException?.Message}");
                Console.WriteLine($"------------------------------------------");
                return StatusCode(500, "Sunucu Hatası: " + ex.Message);
            }
        }

        // 3. POST (Oluşturma)
        [HttpPost]
        public async Task<IActionResult> PostTravelLog([FromForm] CreateLogDto createLogDto)
        {
            var travelLog = new TravelLog
            {
                Title = createLogDto.Title,
                Content = createLogDto.Content,
                Location = createLogDto.Location,
                TravelDate = createLogDto.TravelDate,
                EntryDate = createLogDto.EntryDate,
                Rating = createLogDto.Rating,
                Latitude = createLogDto.Latitude,
                Longitude = createLogDto.Longitude,
                IsPublic = createLogDto.IsPublic,
                Images = new List<TravelLogImage>() 
            };

            if (createLogDto.ImageFiles != null && createLogDto.ImageFiles.Count > 0)
            {
                string webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string uploadsFolder = Path.Combine(webRootPath, "uploads");
                
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                foreach (var file in createLogDto.ImageFiles)
                {
                    if (file.Length > 0)
                    {
                        string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }
                        travelLog.Images.Add(new TravelLogImage { Url = "/uploads/" + uniqueFileName });
                    }
                }
            }

            var createdLog = await _travelLogService.CreateLogAsync(travelLog, this.User);
            
            // Dönüşte de sonsuz döngü olmaması için sadece ID dönüyoruz
            return CreatedAtAction(nameof(GetTravelLog), new { id = createdLog.Id }, new { id = createdLog.Id, message = "Kayıt başarılı" });
        }

        // 4. PUT (Güncelleme)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTravelLog(int id, [FromBody] TravelLog travelLog)
        {
            if (id != travelLog.Id) return BadRequest("ID uyuşmazlığı.");
            var result = await _travelLogService.UpdateLogAsync(id, travelLog, this.User);
            if (!result) return Forbid(); 
            return NoContent(); 
        }

        // 5. DELETE (Günlük Silme)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTravelLog(int id)
        {
            var result = await _travelLogService.DeleteLogAsync(id, this.User);
            if (!result) return Forbid(); 
            return NoContent(); 
        }

        // 6. DELETE (Resim Silme)
        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var result = await _travelLogService.DeleteImageAsync(imageId, this.User);
            if (!result) return BadRequest();
            return NoContent(); 
        }

        [HttpGet("discover")]
 //[AllowAnonymous] // Giriş yapmayanlar da görebilsin kodu 
public async Task<IActionResult> GetDiscoverLogs()
{
    var logs = await _travelLogService.GetDiscoverLogsAsync();
    return Ok(logs);
}
    }

    // --- BU KISIM ÇOK ÖNEMLİ: EKSİK OLAN SINIFLAR ---
    // Bu sınıflar Controller dosyasının içinde, en altta tanımlanmalı.
    
    public class LogDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Location { get; set; }
        public DateTime TravelDate { get; set; }
        public DateTime EntryDate { get; set; }
        public int Rating { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string UserName { get; set; }
        public List<LogImageDto> Images { get; set; }
    }

    public class LogImageDto
    {
        public int Id { get; set; }
        public string Url { get; set; }
    }
}