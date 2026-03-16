namespace backend.Models // TravelLog.cs ile aynı namespace olsun
{
    public class Like
    {
        public int Id { get; set; }
        
        // Hangi gezi?
        public int TravelLogId { get; set; }
        public TravelLog TravelLog { get; set; }

        // Kim beğendi?
        public string UserId { get; set; } 
        public ApplicationUser User { get; set; }

        public DateTime LikeDate { get; set; } = DateTime.UtcNow; // Beğenilme zamanı
    }
}