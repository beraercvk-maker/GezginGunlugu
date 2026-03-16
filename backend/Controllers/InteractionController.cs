using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Dtos;
using backend.Interfaces;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InteractionController : ControllerBase
    {
        private readonly IInteractionService _interactionService;

        public InteractionController(IInteractionService interactionService)
        {
            _interactionService = interactionService;
        }

        // 1. Yorum Ekle (Sadece Giriş Yapanlar)
        [HttpPost("comment")]
        [Authorize]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId)) 
                return Unauthorized("Kullanıcı kimliği doğrulanamadı.");

            await _interactionService.AddCommentAsync(dto, userId);
            return Ok(new { Message = "Yorum başarıyla eklendi." });
        }

        // 2. Yorumları Listele (Herkes Görebilir)
        [HttpGet("comments/{travelLogId}")]
        public async Task<IActionResult> GetComments(int travelLogId)
        {
            var comments = await _interactionService.GetCommentsAsync(travelLogId);
            return Ok(comments);
        }

        // 3. Yorum Sil (Sadece Yorum Sahibi)
        [HttpDelete("comment/{commentId}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _interactionService.DeleteCommentAsync(commentId, userId);

            if (result)
            {
                return Ok(new { Message = "Yorum silindi." });
            }

            return BadRequest("Yorum silinemedi. Yetkiniz yok veya yorum bulunamadı.");
        }

        // 4. Beğen / Vazgeç (Toggle Like)
        [HttpPost("like/{travelLogId}")]
        [Authorize]
        public async Task<IActionResult> ToggleLike(int travelLogId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId)) 
                return Unauthorized();
            
            await _interactionService.ToggleLikeAsync(userId, travelLogId);
            
            // Güncel sayıyı dönelim ki frontend anlık güncellensin
            var newCount = await _interactionService.GetLikeCountAsync(travelLogId);
            
            return Ok(new { Message = "İşlem başarılı.", NewLikeCount = newCount });
        }

        // 5. Beğeni Sayısını Getir
        [HttpGet("like-count/{travelLogId}")]
        public async Task<IActionResult> GetLikeCount(int travelLogId)
        {
            var count = await _interactionService.GetLikeCountAsync(travelLogId);
            return Ok(new { Count = count });
        }

        // 6. Kullanıcının Beğeni Durumu ve Sayı
        [HttpGet("status/{travelLogId}")]
        public async Task<IActionResult> GetInteractionStatus(int travelLogId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isLiked = false;

            if (!string.IsNullOrEmpty(userId))
            {
                isLiked = await _interactionService.IsLikedByUserAsync(travelLogId, userId);
            }
            
            var count = await _interactionService.GetLikeCountAsync(travelLogId);

            return Ok(new { IsLiked = isLiked, Count = count });
        }
    }
}