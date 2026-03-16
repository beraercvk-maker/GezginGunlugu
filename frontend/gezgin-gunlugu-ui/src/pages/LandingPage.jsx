import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; 
import './LandingPage.css';
import AdminNavbar from '../components/AdminNavbar.jsx'; 
import { MapPin, Book, Star, Camera, Globe } from 'lucide-react'; // Globe ekledim

function LandingPage() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/logs" replace />;
  }

  return (
    <div className="landing-container">
      <div className="landing-overlay"></div>
      
      {/* Üst Kısım: Başlık ve Butonlar */}
      <div className="landing-content">
        <div className="hero-section">
            <h1 className="landing-title">Gezgin Günlüğü</h1>
            <p className="landing-subtitle">
            Dünyayı keşfet, anılarını haritala ve hikayeni ölümsüzleştir.<br/>
            Sadece gezme, not al ve hatırla.
            </p>
            
            <div className="landing-buttons">
            <Link to="/login" className="landing-btn btn-primary">
                Hemen Başla
            </Link>
            {/* <Link to="/register" className="landing-btn btn-outline">
                Kayıt Ol
            </Link> */}
            </div>
        </div>

        {/* YENİ EKLENEN KISIM: Özellik Kartları */}
        <div className="features-grid">
            <div className="feature-card">
                <div className="icon-box"><MapPin size={24} /></div>
                <h3>Konumunu İşaretle</h3>
                <p>Gittiğin her yeri haritada pinle.</p>
            </div>
            <div className="feature-card">
                <div className="icon-box"><Camera size={24} /></div>
                <h3>Fotoğraf Yükle</h3>
                <p>En güzel karelerini anılarına ekle.</p>
            </div>
            <div className="feature-card">
                <div className="icon-box"><Book size={24} /></div>
                <h3>Günlük Tut</h3>
                <p>Hislerini ve deneyimlerini yaz.</p>
            </div>
            <div className="feature-card">
                <div className="icon-box"><Star size={24} /></div>
                <h3>Puanla</h3>
                <p>Mekanlara kendi puanını ver.</p>
            </div>
        </div>
      </div>
      
      <AdminNavbar />
    </div>
  );
}

export default LandingPage;