/* Konum: backend/Interfaces/IRepository.cs */

using System.Collections.Generic;
using System.Threading.Tasks; // Task eklendi

namespace backend.Interfaces
{
    // T -> Model (örn: TravelLog)
    public interface IRepository<T> where T : class
    {
        // Okuma (Read)
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();

        // Oluşturma (Create)
        Task AddAsync(T entity);

        // --- GÜNCELLEME ---
        // 'void Update(T entity)' yerine 'Task UpdateAsync(T entity)'
        Task UpdateAsync(T entity);

        // --- GÜNCELLEME ---
        // 'void Delete(T entity)' yerine 'Task DeleteAsync(T entity)'
        Task DeleteAsync(T entity);
    }
}