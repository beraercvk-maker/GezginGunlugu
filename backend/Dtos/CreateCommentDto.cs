namespace backend.Dtos
{
    //yorum eklerken kullanılıcak
    public class CreateCommentDto
    {
        public int TravelLogId { get; set; } //hangi günlüge yorum yapıldığı
        public string Content { get; set; } = string.Empty; //yorumun kendisi
    }



}