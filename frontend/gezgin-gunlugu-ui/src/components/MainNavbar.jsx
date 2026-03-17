import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Search, Bell, Info, Moon, User, LogIn } from 'lucide-react';
import '../components/AdminNavbar.css'; // O güzel CSS'i kullanmaya devam ediyoruz

function MainNavbar() {
  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dropdown için state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sayfa başlığını belirle
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Ana Sayfa';
      case '/logs': return 'Günlüklerim';
      case '/new': return 'Yeni Günlük';
      case '/admin': return 'Admin Paneli';
      case '/login': return 'Giriş Yap';
      case '/register': return 'Kayıt Ol';
      default: return 'Gezgin Günlüğü';
    }
  };

  // Dışarı tıklayınca dropdown kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  return (
    <nav className="admin-navbar" style={{position: 'fixed', top: 0, width: '100%', padding: '10px 20px', zIndex: 1000, boxSizing: 'border-box'}}>
      
      {/* SOL KISIM: Başlık / Logo */}
      <div className="navbar-left">
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-item">Gezgin</Link>
          <span className="breadcrumb-separator"> / </span>
          <span className="breadcrumb-item active">{getPageTitle()}</span>
        </div>
        <Link to="/" style={{textDecoration:'none'}}>
            <h2 className="navbar-brand-text">Gezgin Günlüğü</h2>
        </Link>
      </div>

      {/* SAĞ KISIM */}
      <div className="navbar-right">
        
        {/* Arama Çubuğu */}
        <div className="search-wrapper">
          <div className="search-icon-box">
            <Search size={16} />
          </div>
          <input type="text" placeholder="Ara..." className="search-input" />
        </div>

        {/* İkonlar (Sadece süs) */}
        <button className="navbar-icon-btn"><Bell size={18} /></button>
        <button className="navbar-icon-btn"><Info size={18} /></button>
        <button className="navbar-icon-btn"><Moon size={18} /></button>

        {/* KULLANICI ALANI */}
        {token ? (
          // --- Giriş Yapılmışsa: Profil Avatarı ve Dropdown ---
          <div className="profile-section" style={{position: 'relative'}} ref={dropdownRef}>
            <div 
                className="profile-avatar" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{cursor: 'pointer'}}
            >
                {user && user.firstName ? (
                    <span className="avatar-text">
                        {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                    </span>
                ) : (
                    <User size={20} />
                )}
            </div>

            {/* Dropdown Menü */}
            {isDropdownOpen && (
              <div className="main-dropdown-menu">
                <div className="dropdown-header">
                    <p className="user-name">{user?.firstName} {user?.lastName}</p>
                    <p className="user-email">{user?.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                
                <Link to="/logs" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    Günlüklerim
                </Link>
                <Link to="/new" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    Yeni Ekle
                </Link>
                
                {isAdmin && (
                    <Link to="/admin" className="dropdown-item admin-item" onClick={() => setIsDropdownOpen(false)}>
                        Admin Paneli
                    </Link>
                )}
                
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Çıkış Yap
                </button>
              </div>
            )}
          </div>
        ) : (
          // --- Giriş Yapılmamışsa: Giriş Butonu ---
          <Link to="/login" className="navbar-icon-btn" style={{textDecoration:'none', color:'#4318ff', fontWeight:'600', fontSize:'0.9rem', display:'flex', gap:'5px'}}>
            <LogIn size={18} />
            <span>Giriş</span>
          </Link>
        )}

      </div>
    </nav>
  );
}

export default MainNavbar;
