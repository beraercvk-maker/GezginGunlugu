/* Konum: frontend/gezgin-gunlugu-ui/src/components/AdminSidebar.jsx */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, LogOut, ShieldUser, Settings } from 'lucide-react';
import '../AdminSidebar.css';

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // URL'i takip etmek için bunu kullanıyoruz

  // Şu anki sayfa hangisi?
  const currentPath = location.pathname;

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        Admin Paneli
      </div>

      <ul className="sidebar-menu">
        
        {/* 1. KULLANICI YÖNETİMİ (URL: /admin) */}
        <li className="sidebar-item">
          <button 
            // Eğer URL tam olarak '/admin' ise 'active' sınıfını ekle (Mavi yap)
            className={`sidebar-link ${currentPath === '/admin' ? 'active' : ''}`} 
            onClick={() => navigate('/admin')}
          >
            <Users size={20} className="sidebar-icon" />
            Kullanıcı Yönetimi
          </button>
        </li>

       {/* 2. GÜNLÜK YÖNETİMİ (URL: /logs) -> DİREKT MEVCUT SAYFAYA */}
        <li className="sidebar-item">
            <button 
                // Eğer URL '/logs' ise mavi yanacak
                className={`sidebar-link ${currentPath === '/logs' ? 'active' : ''}`}
                // Tıklayınca direkt senin hazırladığın LogListPage'e gidecek
                onClick={() => navigate('/logs')}
            >
            <ShieldUser size={20} className="sidebar-icon" />
            Günlük Yönetimi
            </button>
        </li>

        {/* 3. DASHBOARD (URL: /dashboard) */}
        <li className="sidebar-item">
          <button 
            // Eğer URL '/dashboard' ise 'active' sınıfını ekle
            className={`sidebar-link ${currentPath === '/dashboard' ? 'active' : ''}`} 
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={20} className="sidebar-icon" />
            Dashboard
          </button>
        </li>

        {/* 4. AYARLAR (Pasif) */}
        <li className="sidebar-item">
          <button className="sidebar-link" onClick={() => alert('Ayarlar yakında eklenecek!')}>
            <Settings size={20} className="sidebar-icon" />
            Ayarlar
          </button>
        </li>

      </ul>

      {/* FOOTER: Siteye Dön */}
      <div className="sidebar-footer">
        <button className="sidebar-link back-to-site" onClick={() => navigate('/')}>
          <LogOut size={20} className="sidebar-icon" />
          Siteye Dön
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;