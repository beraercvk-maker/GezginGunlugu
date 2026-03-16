/* Konum: src/pages/ForgotPassword.jsx */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import Swal from 'sweetalert2';
import '../AuthForm.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Saniye cinsinden sayaç
  const [successMsg, setSuccessMsg] = useState(false); // Başarılı mesajı kontrolü

  // Sayaç mantığı (Her saniye azalır)
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      
      // Başarılı olursa:
      setSuccessMsg(true); // Mesajı göster
      setTimer(180); // 3 Dakika (180 saniye) başlat
      
      Swal.fire({
        icon: 'success',
        title: 'Mail Gönderildi!',
        text: 'Lütfen e-posta kutunuzu kontrol edin.',
        confirmButtonColor: '#2563eb'
      });

    } catch (error) {
      setSuccessMsg(false);
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: error.response?.data?.message || 'Bir hata oluştu.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setLoading(false);
    }
  };

  // Saniyeyi Dakika:Saniye formatına çevirme (Örn: 2:45)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="auth-wrapper">
      <Link to="/" className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Ana Sayfa
      </Link>

      <div className="auth-card">
        <div className="auth-logo-area">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            <span className="auth-logo-text">Gezgin Günlüğü</span>
        </div>

        <h2 className="auth-title">Şifremi Unuttum</h2>
        <p style={{textAlign:'center', color:'#6b7280', marginBottom:'1.5rem', fontSize:'0.95rem'}}>
          Hesabınıza kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">E-Posta Adresi</label>
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              
              <input 
                type="email" 
                className="auth-input" 
                placeholder="ornek@mail.com"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={timer > 0} // Süre bitene kadar input da kilitlensin (istersen kaldırabilirsin)
              />
            </div>
          </div>

          {/* BUTON: Sayaç varsa kilitli, yoksa açık */}
          <button 
            type="submit" 
            disabled={loading || timer > 0} 
            className="submit-btn"
            style={timer > 0 ? { backgroundColor: '#9ca3af', cursor: 'not-allowed' } : {}}
          >
            {loading ? 'Gönderiliyor...' : timer > 0 ? `Tekrar gönder: ${formatTime(timer)}` : 'Sıfırlama Linki Gönder'}
          </button>
        </form>

        {/* BAŞARILI YAZISI: Butonun altında çıkar */}
        {successMsg && (
            <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #a7f3d0'}}>
                ✅ Mail adresinize sıfırlama linki gönderildi!
            </div>
        )}

        <div className="auth-footer">
          Şifrenizi hatırladınız mı? 
          <Link to="/login" className="link-btn">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;