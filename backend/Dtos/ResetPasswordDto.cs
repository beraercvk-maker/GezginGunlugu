namespace backend.Dtos
{
    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty; // Bunu ekledik
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}