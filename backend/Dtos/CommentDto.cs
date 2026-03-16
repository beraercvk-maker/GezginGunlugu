namespace backend.Dtos
{

    //yorumları dışarıya aktarırken kullanılıcak
    public class CommentDto
    {
        
        public int Id { get; set; } 
        
        public string UserName { get; set; } 
        public string Content { get; set; }

        public DateTime CreatedDate { get; set; }
        
    }
}