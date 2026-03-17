import React, { useState, useEffect, useRef } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; 
import '../Navbar.css'; 
import { Book, Globe } from 'lucide-react';

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
    if (!user) return 'Misafir';
    const firstName = user.firstName || user.FirstName || user.given_name || user.GivenName;
    const lastName = user.lastName || user.LastName || user.family_name || user.FamilyName;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    const email = user.email || user.Email || user.sub;
    return email || 'Kullanıcı';
  };

  return (
    // DİKKAT: Ana kapsayıcıya display:flex verdik ki yan yana dizilsinler
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      
      {/* 1. KUTU: SOL TARA (SADECE LOGO) */}
      <div className="navbar-brand">
        <Link to="/" style={{ 
            textDecoration: 'none', 
            color: '#007bff', 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
          <Book size={32} strokeWidth={2.5} />
          Gezgin Günlüğü
        </Link>
      </div>

      {/* 2. KUTU: ORTA SOL (KEŞFET BUTONU - LOGODAN AYRI) */}
      {/* marginRight: 'auto' diyerek sağ tarafı itiyoruz */}
      <div style={{ marginLeft: '25px', marginRight: 'auto' }}>
        <Link 
            to="/discover" 
            style={{
                textDecoration: 'none', 
                color: '#475569', 
                fontWeight: '600', 
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap' // Yazının alt satıra kaymasını engeller
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#007bff';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
            }}
        >
            <Globe size={20} /> Keşfet
        </Link>
      </div>

      {/* 3. KUTU: SAĞ TARAF (KULLANICI MENÜSÜ) */}
      <ul className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0, padding: 0 }}>
        
        {token && isAdmin && (
          <li>
            <Link to="/dashboard" className="admin-link" style={{ 
                color: '#dc3545', 
                fontWeight: '600', 
                textDecoration: 'none', 
                border:'1px solid #dc3545', 
                padding:'6px 15px', 
                borderRadius:'20px',
                fontSize: '0.9rem',
                backgroundColor: '#fff5f5',
                whiteSpace: 'nowrap'
            }}>
              🛠️ Admin Paneli
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