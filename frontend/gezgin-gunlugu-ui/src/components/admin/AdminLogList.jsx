import React from 'react';
import AdminSidebar from '../AdminSidebar';
import '../../pages/AdminPanelPage.css'; // Aynı CSS tasarımını koruyoruz

const AdminLogList = () => {
  return (
    <div className="admin-layout">
      {/* Sidebar'ı ekliyoruz ki menü kaybolmasın */}
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1>Günlük Yönetimi</h1>
          <p>Kullanıcıların paylaştığı gezi notlarını buradan yönetebilirsiniz.</p>
        </div>

        {/* İçerik Kartı */}
        <div className="admin-card">
          <div style={{ textAlign: 'center', padding: '50px', color: '#A3AED0' }}>
            <h3>🚧 Yapım Aşamasında 🚧</h3>
            <p>Buraya yakında tüm gezilerin listelendiği ve silinebildiği bir tablo gelecek.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogList;