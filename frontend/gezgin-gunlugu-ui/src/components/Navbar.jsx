import React, { useState, useEffect, useRef } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; 
import '../Navbar.css'; 
// 1. HATA ÇÖZÜMÜ: Book ikonunu kütüphaneden çağırıyoruz
import { Book } from 'lucide-react';

function NavBar() {
  
  const { token, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); 

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }
      setIsDropdownOpen(false); 
    }
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]); 

  const handleNewLogClick = () => {
    navigate('/new'); 
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false); 
    logout(); 
    navigate('/'); 
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const getUserDisplayName = () => {
    // 1. Eğer user hiç yoksa
    if (!user) return 'Misafir';

    // 2. Konsola yazdıralım ki ne geldiğini görelim (Hata ayıklama için)
    // F12 -> Console sekmesinde "NAVBAR USER:" diye aratıp bakabilirsin.
    console.log("NAVBAR USER:", user);

    // 3. İsim alanlarını farklı ihtimallerle kontrol et
    // Backend bazen "firstName", bazen "FirstName", bazen de Token içinde "given_name" gönderebilir.
    const firstName = user.firstName || user.FirstName || user.given_name || user.GivenName;
    const lastName = user.lastName || user.LastName || user.family_name || user.FamilyName;

    // 4. İsim ve Soyisim varsa birleştir
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    // 5. İsim yoksa E-posta göster (Onu da büyük/küçük harf kontrol et)
    const email = user.email || user.Email || user.sub;
    
    return email || 'Kullanıcı';
  };

  return (
    <nav className="navbar">
      
      {/* 2. YENİ: Sol Taraf (Logo + İkon) */}
      <div className="navbar-brand">
        <Link to="/" style={{ 
            textDecoration: 'none', 
            color: '#007bff', 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            display: 'flex',       // İkon ve yazıyı yan yana dizer
            alignItems: 'center',  // Dikey ortalar
            gap: '10px'            // Aralarına boşluk koyar
          }}>
          {/* Kitap İkonu */}
          <Book size={32} strokeWidth={2.5} />
          Gezgin Günlüğü
        </Link>
      </div>

      {/* Sağ Taraf: Menü Linkleri */}
      <ul className="navbar-nav">
        
        {token && isAdmin && (
          <li>
            <Link to="/dashboard" className="admin-link" style={{ color: '#dc3545', fontWeight: '600', textDecoration: 'none' }}>
              Admin Paneli
            </Link>
          </li>
        )}

        {token ? (
          <li className="profile-dropdown" ref={dropdownRef}>
            <button 
              className="profile-button nav-button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            >
              Merhaba, {getUserDisplayName()} ▼
            </button>

            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/logs" onClick={() => setIsDropdownOpen(false)}>
                    Tüm Günlüklerim
                  </Link>
                </li>
                <li>
                  <button 
                    className="dropdown-button"
                    onClick={() => {
                      handleNewLogClick();
                      setIsDropdownOpen(false);
                    }}
                  >
                    Yeni Günlük Ekle
                  </button>
                </li>


                <li>
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    Profil Ayarları
                  </Link>
                </li>
                <li>
                  <button 
                    className="dropdown-button dropdown-logout"
                    onClick={handleLogoutClick}
                  >
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : (
          <li className="profile-dropdown">
            <button onClick={handleLoginClick} className="nav-button login-button">
              Giriş/Kayıt Ol
            </button>
          </li>
        )}
        
      </ul>
    </nav>
  );
}

export default NavBar;