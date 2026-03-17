/* Konum: frontend/gezgin-gunlugu-ui/src/pages/AdminPanelPage.jsx */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext'; 
import apiClient from '../api/apiClient'; 
import Swal from 'sweetalert2'; 
// --- DEĞİŞİKLİK: Search ve User ikonlarını ekledik ---
import { Trash2, ShieldOff, ShieldCheck, UserCog, Search, User } from 'lucide-react'; 
import './AdminPanelPage.css'; 
import AdminSidebar from '../components/AdminSidebar';

function formatLockoutDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (date < new Date()) return null; 
  return date.toLocaleString(); 
}

function AdminPanelPage() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- YENİ EKLENDİ: Arama çubuğu için state ---
  const [searchTerm, setSearchTerm] = useState(""); 

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
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // --- İŞLEMLER (Silme, Banlama, Rol) ---
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
          // Silinen kullanıcıyı yerel state'den de çıkaralım (ekstra performans)
          setUsers(prev => prev.filter(u => u.id !== userId));
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

  // --- YENİ EKLENDİ: Filtreleme Mantığı ---
  // Kullanıcının Adı, Soyadı veya Email'i aranan kelimeyi içeriyor mu?
  const filteredUsers = users.filter(u => {
      const term = searchTerm.toLowerCase();
      // İsim boş gelebilir diye önlem alıyoruz (u.firstName || '')
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phoneNumber || '').toLowerCase(); // Telefonu al
      
      return fullName.includes(term) || email.includes(term) || phone.includes(term);
  });

  if (!isAdmin) {
    return <div className="access-denied"><h2>Erişim Reddedildi</h2></div>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        
        {/* 1. Başlık Bölümü */}
        <div className="admin-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap'}}>
          <div>
            <h1>Kullanıcı Yönetimi</h1>
            <p>Sistemdeki tüm kullanıcıları buradan yönetebilirsiniz.</p>
          </div>

          {/* --- YENİ EKLENDİ: Arama Kutusu --- */}
          <div style={{position:'relative', width:'300px', marginTop:'10px'}}>
            <Search size={18} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
            <input 
                type="text" 
                placeholder="İsim,E-posta veya telefon ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width:'100%', padding:'10px 10px 10px 35px', 
                    borderRadius:'8px', border:'1px solid #cbd5e1', 
                    outline:'none', fontSize:'0.95rem'
                }}
            />
          </div>
          {/* ---------------------------------- */}
        </div>
        
        {loading && <p>Yükleniyor...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          /* 2. Kart Yapısı */
          <div className="admin-card">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    {/* --- YENİ EKLENDİ: Ad Soyad Sütun Başlığı --- */}
                    <th>Ad Soyad</th>
                    {/* --------------------------------------------- */}
                    <th>E-posta</th>
                    <th>Telefon</th>
                    <th>Roller</th>
                    <th>Durum</th> 
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Kullanıcı bulunamadı.</td></tr>
                  ) : (
                    // --- DEĞİŞİKLİK: users.map yerine filteredUsers.map kullanıyoruz ---
                    filteredUsers.map(u => {
                      const isCurrentUser = (u.id === user?.id || u.id === user?.sub);
                      const lockoutEndDate = formatLockoutDate(u.lockoutEnd);
                      const isBanned = lockoutEndDate != null;

                      return (
                        <tr key={u.id}>
                          {/* --- YENİ EKLENDİ: Ad Soyad Sütunu --- */}
                          <td>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <div style={{
                                    width:'32px', height:'32px', borderRadius:'50%', 
                                    background:'#e0f2fe', color:'#0369a1', 
                                    display:'flex', alignItems:'center', justifyContent:'center'
                                }}>
                                    <User size={16} />
                                </div>
                                <span style={{fontWeight:'600', color:'#334155'}}>
                                    {u.firstName} {u.lastName}
                                </span>
                            </div>
                          </td>
                          {/* ------------------------------------- */}

                          <td>{u.email}</td>
                          <td>{u.phoneNumber || "-"}</td>
                          <td>
                            <strong>{u.roles.join(', ') || "User"}</strong>
                          </td>
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
                                    <button onClick={() => handleUnban(u.id)} className="admin-btn btn-unban" title="Banı Kaldır">
                                      <ShieldCheck size={18} />
                                    </button>
                                  ) : (
                                    <button onClick={() => handleBan(u.id, u.email)} className="admin-btn btn-ban" title="Banla">
                                      <ShieldOff size={18} />
                                    </button>
                                  )}
                                  <button onClick={() => handleRoleChange(u.id, u.email, u.roles)} className="admin-btn btn-role" title="Rol Değiştir">
                                    <UserCog size={18} />
                                  </button>
                                  <button onClick={() => handleDelete(u.id, u.email)} className="admin-btn btn-delete-user" title="Sil">
                                    <Trash2 size={18} />
                                  </button>
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
    </div>
  );
}

export default AdminPanelPage;