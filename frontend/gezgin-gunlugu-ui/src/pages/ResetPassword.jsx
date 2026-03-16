import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService'; 
import Swal from 'sweetalert2'; // Kütüphanenin yüklü olduğundan emin ol
import { Book, Lock, Key, ArrowLeft } from 'lucide-react';
import '../AuthForm.css'; 

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ResetPassword.jsx içindeki handleSubmit fonksiyonunu bununla değiştir:

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Dikkat',
        text: 'Şifreler uyuşmuyor.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ email, token, newPassword });
      
      // --- KESİN ÇÖZÜM BURADA ---
      Swal.fire({
        icon: 'success',
        title: 'Şifreniz Kaydedildi!',
        text: 'Giriş ekranına yönlendiriliyorsunuz...',
        showConfirmButton: false, 
        timer: 2000,           // 2 saniye bekle
        timerProgressBar: true,
        allowOutsideClick: false, // Dışarı tıklayıp kapatamasın
        allowEscapeKey: false     // ESC ile kapatamasın
      }).then((result) => {
        // Bu kod bloğu SADECE timer bittiğinde çalışır
        navigate('/login');
      });

    } catch (error) {
      let errorMsg = error.response?.data?.message || 'Şifre sıfırlanamadı.';
      if (typeof error.response?.data === 'object') {
         errorMsg = "Şifre kriterlere uymuyor veya token süresi dolmuş.";
      }

      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: errorMsg,
        confirmButtonColor: '#2563eb'
      });
    } finally {
      // Başarılı durumda loading'i kapatmıyoruz ki yönlendirme olana kadar buton dönmeye devam etsin (daha şık durur)
      // Sadece hata durumunda kapatmak istersen burayı catch bloğuna taşıyabilirsin.
      // Ama şimdilik kalsın, sorun olmaz.
      setLoading(false);
    }
  };

  // Link bozuksa gösterilecek ekran
  if (!token || !email) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{textAlign:'center'}}>
          <h2 className="auth-title" style={{color:'#dc2626'}}>Geçersiz Bağlantı</h2>
          <p style={{color:'#6b7280', marginBottom:'1.5rem'}}>
            Link hatalı. Lütfen mailinize gelen linke tekrar tıklayın.
          </p>
          <button onClick={() => navigate('/')} className="submit-btn">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <button onClick={() => navigate('/')} className="back-button">
        <ArrowLeft size={20} />
        Ana Sayfa
      </button>

      <div className="auth-card">
        <div className="auth-logo-area">
          <Book size={40} color="#2563eb" />
          <span className="auth-logo-text">Gezgin Günlüğü</span>
        </div>

        <h2 className="auth-title">Yeni Şifre Belirle</h2>

        <form onSubmit={handleSubmit}>
          
          <div className="auth-input-group">
            <label className="auth-label">Yeni Şifre</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="******"
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="6"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Şifre Tekrar</label>
            <div className="input-wrapper">
              <Key className="input-icon" />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="******"
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;