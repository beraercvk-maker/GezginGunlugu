import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../AuthContext.jsx';
import { Book, Mail, Lock, ArrowLeft } from 'lucide-react';
import '../AuthForm.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    console.log("1. Giriş işlemi başlatıldı..."); // KONTROL 1

    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      
      console.log("2. Backend'den cevap geldi:", response); // KONTROL 2
      console.log("3. Gelen Data:", response.data); // KONTROL 3

      // Backend bazen "Token" (büyük harf), bazen "token" (küçük harf) dönebilir.
      // İkisini de kontrol edelim:
      const incomingToken = response.data?.token || response.data?.Token;

      if (incomingToken) {
        console.log("4. Token bulundu:", incomingToken); // KONTROL 4

        // Token'ı kaydediyoruz
        localStorage.setItem("token", incomingToken);
        console.log("5. Token localStorage'a kaydedildi!"); // KONTROL 5
        
        // Kullanıcı ID varsa onu da alalım (userId veya UserId)
        const incomingUserId = response.data?.userId || response.data?.UserId;
        if (incomingUserId) {
            localStorage.setItem("userId", incomingUserId);
        }

        // Context Login
        await login(incomingToken, rememberMe);
        console.log("6. Context login fonksiyonu çalıştı."); // KONTROL 6
        
        navigate('/');
      } else {
        console.error("7. HATA: Cevap geldi ama içinde 'token' yok!");
        setError('Giriş başarılı ama token alınamadı.');
      }

    } catch (err) {
      console.error("8. Backend Hatası:", err); // KONTROL 8
      if (err.response) {
         console.log("Hata Detayı:", err.response.data);
      }

      if (err.response && err.response.status === 401) {
        setError('E-posta veya şifre hatalı.');
      } else {
        setError('Giriş sırasında bir hata oluştu.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2 className="auth-title">Giriş Yap</h2>
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">E-posta</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="mail@site.com" required />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Şifre</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" required />
            </div>
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Beni hatırla</span>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="auth-footer">
          <button onClick={() => navigate('/register')} className="link-btn">Kayıt Ol</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;