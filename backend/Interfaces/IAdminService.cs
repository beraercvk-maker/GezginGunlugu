using backend.Dtos; // UserDto modelimiz burada
using Microsoft.AspNetCore.Identity; // IdentityResult (Silme işlemi sonucu için)
using System.Collections.Generic;
using System.Threading.Tasks;


namespace backend.Dtos
{


    public interface IAdminService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<IdentityResult> DeleteUserAsync(string userId);

        Task<IdentityResult> BanUserAsync(String userId, BanUserDto banUserDto);
        Task<IdentityResult> UpdateUserRoleAsync(string userId,UpdateRoleDto updateRoleDto);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
    

}