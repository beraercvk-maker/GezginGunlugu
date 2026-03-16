using System.ComponentModel.DataAnnotations; // [Required] için

namespace backend.Dtos
{
    public class UpdateRoleDto
    {
        // Yeni rolün adını (örn: "Admin" veya "User") tutar
        [Required(ErrorMessage = "Rol adı gereklidir.")]
        public string RoleName { get; set; } = string.Empty;
    }
}