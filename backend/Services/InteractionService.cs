using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;       
using backend.Dtos;       
using backend.Interfaces; 
using backend.Models;     
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
   public class InteractionService : IInteractionService
    {
        private readonly AppDbContext _context;

        public InteractionService(AppDbContext context)
        {
            _context = context;
        }

        // 1. Yorum Ekle
        public async Task AddCommentAsync(CreateCommentDto dto, string userId)
        {
            var comment = new Comment
            {
                TravelLogId = dto.TravelLogId,
                UserId = userId,
                Content = dto.Content,
                CreatedDate = DateTime.Now
            };

            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
        }

        // 2. Yorumları Getir
        public async Task<List<CommentDto>> GetCommentsAsync(int travelLogId)
        {
            var comments = await _context.Comments
                .Where(c => c.TravelLogId == travelLogId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedDate)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    UserName = c.User.FirstName + " " + c.User.LastName,
                    CreatedDate = c.CreatedDate
                })
                .ToListAsync();
            return comments;
        }

        // 3. Beğeni İşlemi (Like/Unlike)
        public async Task ToggleLikeAsync(string userId, int travelLogId)
        {
            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(x => x.UserId == userId && x.TravelLogId == travelLogId);

            if (existingLike != null)
            {
                _context.Likes.Remove(existingLike); // Varsa sil
            }
            else
            {
                var like = new Like
                {
                    UserId = userId,
                    TravelLogId = travelLogId
                };
                await _context.Likes.AddAsync(like); // Yoksa ekle
            }
            await _context.SaveChangesAsync();
        }

        // 4. Beğeni Sayısı
        public async Task<int> GetLikeCountAsync(int travelLogId)
        {
            return await _context.Likes.CountAsync(x => x.TravelLogId == travelLogId);
        }

        // 5. Yorum Silme 
        public async Task<bool> DeleteCommentAsync(int commentId, string userId) // Sadece yorum sahibi silebilir
        {
            // ID'ye göre doğru yorumu bul
            var comment = await _context.Comments.FindAsync(commentId);
            
            // Yorum yoksa false dön
            if (comment == null) return false;

            // Yorumu silmeye çalışan kişi, yorumun sahibi mi?
            if (comment.UserId != userId) 
            {
                return false;
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }

        // 6. Kullanıcı Beğendi mi?
        public async Task<bool> IsLikedByUserAsync(int travelLogId, string userId)
        {
            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(x => x.TravelLogId == travelLogId && x.UserId == userId);

            return existingLike != null;
        }
    }
}