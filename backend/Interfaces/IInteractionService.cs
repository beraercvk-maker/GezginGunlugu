using backend.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    
    public interface IInteractionService
    {
        Task AddCommentAsync(CreateCommentDto createCommentDto, string userId); //yorum ekleme metodu
        Task <List<CommentDto>> GetCommentsAsync(int travelLogId); //yorum listeleme metodu

        Task ToggleLikeAsync(string userId, int travelLogId); //like ekleme/kaldırma metodu
        Task<int>GetLikeCountAsync(int travelLogId); //like sayısını getirme metodu
        Task<bool>DeleteCommentAsync(int commentId, string userId); //yorum silme metodu
        Task<bool> IsLikedByUserAsync(int travelLogId, string userId); //kullanıcının beğenip beğenmediğini kontrol etme metodu

    }
}

