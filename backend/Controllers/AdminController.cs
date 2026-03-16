/* Konum: backend/Controllers/AdminController.cs */

using backend.Dtos; // BanUserDto, UpdateRoleDto ve YENİ DashboardStatsDto
using backend.Interfaces; // IAdminService
using Microsoft.AspNetCore.Authorization; // [Authorize]
using Microsoft.AspNetCore.Http; // StatusCodes
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Bu controller'daki tüm endpoint'ler "Admin" rolü gerektirir
    [Authorize(Roles = "Admin")] 
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // --- YENİ EKLENEN DASHBOARD STATS ENDPOINT'İ ---
        // 0. GET: api/admin/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        // 1. GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        // 2. DELETE: api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _adminService.DeleteUserAsync(id);
            if (result.Succeeded) return NoContent();
            return BadRequest(result.Errors);
        }

        // 3. PUT: api/admin/users/{id}/ban
        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> BanUser(string id, [FromBody] BanUserDto banUserDto)
        {
            var result = await _adminService.BanUserAsync(id, banUserDto);
            if (result.Succeeded) return NoContent();
            return BadRequest(result.Errors);
        }

        // 4. PUT: api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleDto updateRoleDto)
        {
            var result = await _adminService.UpdateUserRoleAsync(id, updateRoleDto);
            if (result.Succeeded) return NoContent();
            return BadRequest(result.Errors);
        }
    }
}