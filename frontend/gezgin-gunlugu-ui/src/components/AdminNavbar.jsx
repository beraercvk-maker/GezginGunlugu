import React from 'react';
import '../AdminNavbar.css';
import { Book } from 'lucide-react';

function AdminNavbar() {
  // Şimdiki yılı otomatik al
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-navbar">
      <div className="footer-content">
        <div className="footer-brand">
        <Book size={24} className="footer-icon" />
        <span className="footer-title">Gezgin Günlüğü</span>
      </div>
        <span className="footer-title">© {currentYear} Gezgin Günlüğü. Tüm hakları saklıdır.</span>
      </div>
    </footer>
  );
}

export default AdminNavbar;