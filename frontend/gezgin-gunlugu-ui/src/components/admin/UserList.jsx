/* Konum: src/components/admin/UserList.jsx */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext'; 
import apiClient from '../../api/apiClient'; 
import Swal from 'sweetalert2'; 
import { Trash2, ShieldOff, ShieldCheck, UserCog } from 'lucide-react'; 
import '../../pages/AdminPanelPage.css'; // CSS dosyasını buradan çekiyoruz

function formatLockoutDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (date < new Date()) return null; 
  return date.toLocaleString(); 
}

const UserList = () => {
  const { user } = useAuth(); // isAdmin kontrolü artık üst sayfada yapılacak
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Kullanıcı listesi hatası:", err);
      setError("Kullanıcı listesi alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- İŞLEMLER ---
  const handleDelete = (userId, userEmail) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: `'${userEmail}' silinecek!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ee5d50',
      cancelButtonColor: '#a3aed0',
      confirmButtonText: 'Sil'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/api/admin/users/${userId}`);
          Swal.fire('Silindi!', 'Kullanıcı silindi.', 'success');
          fetchUsers();
        } catch (err) {
          Swal.fire('Hata!', 'Silme işlemi başarısız.', 'error');
        }
      }
    });
  };

  const handleBan = (userId, userEmail) => {
    Swal.fire({
      title: 'Ban Süresi',
      input: 'select',
      inputOptions: { '1': '1 Saat', '24': '1 Gün', '168': '7 Gün', '876000': 'Kalıcı' },
      inputPlaceholder: 'Süre seçin',
      showCancelButton: true,
      confirmButtonText: 'Banla'
    }).then(async (result) => {
      if (result.value) {
        const hours = parseInt(result.value);
        const date = new Date();
        date.setHours(date.getHours() + hours);
        try {
          await apiClient.put(`/api/admin/users/${userId}/ban`, { lockoutEndDate: date.toISOString() });
          Swal.fire('Banlandı!', 'Kullanıcı engellendi.', 'success');
          fetchUsers();
        } catch (err) {
          Swal.fire('Hata!', 'Banlama başarısız.', 'error');
        }
      }
    });
  };

  const handleUnban = async (userId) => {
    try {
      await apiClient.put(`/api/admin/users/${userId}/ban`, { lockoutEndDate: null });
      Swal.fire('Başarılı', 'Ban kaldırıldı.', 'success');
      fetchUsers();
    } catch (err) {
      Swal.fire('Hata!', 'İşlem başarısız.', 'error');
    }
  };
  
  const handleRoleChange = (userId, userEmail, currentRoles) => {
    const isCurrentlyAdmin = currentRoles.includes('Admin');
    Swal.fire({
      title: 'Rol Değiştir',
      input: 'radio',
      inputOptions: { 'Admin': 'Admin', 'User': 'User' },
      inputValue: isCurrentlyAdmin ? 'Admin' : 'User',
      showCancelButton: true,
      confirmButtonText: 'Güncelle'
    }).then(async (result) => {
      if (result.value) {
        try {
          await apiClient.put(`/api/admin/users/${userId}/role`, { roleName: result.value });
          Swal.fire('Güncellendi', 'Rol değiştirildi.', 'success');
          fetchUsers();
        } catch (err) {
          const msg = err.response?.data?.[0]?.description || 'Hata oluştu.';
          Swal.fire('Hata!', msg, 'error');
        }
      }
    });
  };

  return (
    <div>
        <div className="admin-header">
          <h1>Kullanıcı Yönetimi</h1>
          <p>Sistemdeki tüm kullanıcıları buradan yönetebilirsiniz.</p>
        </div>

        {loading && <p>Yükleniyor...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-card">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>E-posta</th>
                    <th>Telefon</th>
                    <th>Roller</th>
                    <th>Durum</th> 
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="5">Kullanıcı yok.</td></tr>
                  ) : (
                    users.map(u => {
                      const isCurrentUser = (u.id === user?.id || u.id === user?.sub);
                      const lockoutEndDate = formatLockoutDate(u.lockoutEnd);
                      const isBanned = lockoutEndDate != null;

                      return (
                        <tr key={u.id}>
                          <td>{u.email}</td>
                          <td>{u.phoneNumber || "-"}</td>
                          <td><strong>{u.roles.join(', ') || "User"}</strong></td>
                          <td>
                            {isBanned ? (
                              <span className="status-badge status-banned">Banlı</span>
                            ) : (
                              <span className="status-badge status-active">Aktif</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-actions">
                              {isCurrentUser ? (
                                 <span className="admin-self">Siz</span>
                              ) : (
                                <>
                                  {isBanned ? (
                                    <button onClick={() => handleUnban(u.id)} className="admin-btn btn-unban" title="Banı Kaldır"><ShieldCheck size={18} /></button>
                                  ) : (
                                    <button onClick={() => handleBan(u.id, u.email)} className="admin-btn btn-ban" title="Banla"><ShieldOff size={18} /></button>
                                  )}
                                  <button onClick={() => handleRoleChange(u.id, u.email, u.roles)} className="admin-btn btn-role" title="Rol Değiştir"><UserCog size={18} /></button>
                                  <button onClick={() => handleDelete(u.id, u.email)} className="admin-btn btn-delete-user" title="Sil"><Trash2 size={18} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default UserList;