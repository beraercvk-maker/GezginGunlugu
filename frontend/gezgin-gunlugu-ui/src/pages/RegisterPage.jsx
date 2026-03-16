import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
// İkonları import ediyoruz (Yeni eklenenler: User, Phone, Calendar, Key)
import { Book, Mail, Lock, ArrowLeft, User, Phone, Calendar, Key, CheckCircle } from 'lucide-react';
import '../AuthForm.css'; 

function RegisterPage() {
  // --- State'ler ---
  // Adım Kontrolü (1: Kayıt Formu, 2: Doğrulama Formu)
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');

  // Form Verileri
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [hasAgreedToKvkk, setHasAgreedToKvkk] = useState(false);

  const [errors, setErrors] = useState([]); 
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // --- 1. ADIM: KAYIT OLMA ---
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErrors([]); 
    setSubmitting(true);

    if (password !== confirmPassword) {
      setErrors(['Şifreler uyuşmuyor.']);
      setSubmitting(false);
      return; 
    }
    
    if (!hasAgreedToKvkk) {
      setErrors(['Kayıt olmak için KVKK metnini onaylamanız gerekmektedir.']);
      setSubmitting(false);
      return;
    }

    try {
      const registerData = {
        firstName, lastName, email, password, phoneNumber, birthDate, hasAgreedToKvkk
      };

      // Backend'e kayıt isteği atıyoruz
      await apiClient.post('/api/auth/register', registerData);
      
      // Başarılı olursa 2. Adıma (Doğrulama Ekranına) geçiyoruz
      setSubmitting(false);
      setStep(2); 
      // Kullanıcıya bilgi verelim (isteğe bağlı alert kaldırılabilir)
      alert("Kayıt başarılı! Lütfen e-postanıza gelen kodu giriniz.");

    } catch (err) {
      handleErrors(err);
      setSubmitting(false); 
    }
  };

  // --- 2. ADIM: KOD DOĞRULAMA ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      // Backend'e kod doğrulama isteği
      await apiClient.post('/api/auth/verify-code', {
        email: email, // State'ten gelen email
        code: verificationCode
      });

      // Başarılıysa giriş sayfasına yönlendir
      alert("Hesabınız başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.");
      navigate('/login');

    } catch (err) {
      setErrors(["Girdiğiniz kod hatalı veya süresi dolmuş."]);
    } finally {
      setSubmitting(false);
    }
  };

  // Hata Yakalama Yardımcı Fonksiyonu
  const handleErrors = (err) => {
    if (err.response && err.response.data) {
        if (err.response.data.errors) {
            if (Array.isArray(err.response.data.errors)) {
              setErrors(err.response.data.errors.map(error => error.description));
            } else if (typeof err.response.data.errors === 'object') {
               setErrors(Object.values(err.response.data.errors).flat());
            }
        } else if (err.response.data.identityErrors) {
            setErrors(err.response.data.identityErrors.map(error => error.description));
        } else {
             setErrors(['Bilinmeyen bir hata oluştu.']);
        }
      } else {
        setErrors(['İşlem sırasında bir hata oluştu.']);
      }
  };

  return (
    <div className="auth-wrapper">
      {/* Geri Butonu */}
      <button 
        onClick={() => navigate('/')} 
        className="back-button"
      >
        <ArrowLeft size={20} />
        Ana Sayfa
      </button>

      {/* Kart */}
      <div className="auth-card" style={{maxWidth: '500px'}}>
        
        {/* Logo */}
        <div className="auth-logo-area">
          <Book size={40} color="#2563eb" />
          <span className="auth-logo-text">Gezgin Günlüğü</span>
        </div>

        {/* Başlık - Adıma göre değişir */}
        <h2 className="auth-title">
            {step === 1 ? "Aramıza Katıl" : "Hesabı Doğrula"}
        </h2>

        {/* Hata Kutusu */}
        {errors.length > 0 && (
            <div className="error-box" style={{textAlign:'left'}}>
              <ul style={{margin:0, paddingLeft:'20px'}}>
                {errors.map((error, index) => (<li key={index}>{error}</li>))}
              </ul>
            </div>
        )}

        {/* --- ADIM 1: KAYIT FORMU --- */}
        {step === 1 && (
            <form onSubmit={handleSubmit}>
              
              {/* Ad - Soyad */}
              <div style={{display: 'flex', gap: '15px'}}>
                <div className="auth-input-group" style={{flex: 1}}>
                  <label className="auth-label">Ad</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="auth-input"
                      required
                    />
                  </div>
                </div>
                <div className="auth-input-group" style={{flex: 1}}>
                  <label className="auth-label">Soyad</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="auth-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* E-posta */}
              <div className="auth-input-group">
                <label className="auth-label">E-posta</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              {/* Telefon - Doğum Tarihi */}
              <div style={{display: 'flex', gap: '15px'}}>
                 <div className="auth-input-group" style={{flex: 1}}>
                    <label className="auth-label">Telefon</label>
                    <div className="input-wrapper">
                        <Phone className="input-icon" />
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="auth-input"
                            placeholder="555..."
                            required
                        />
                    </div>
                </div>
                <div className="auth-input-group" style={{flex: 1}}>
                    <label className="auth-label">Doğum Tarihi</label>
                    <div className="input-wrapper">
                        <Calendar className="input-icon" />
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>
                </div>
              </div>

              {/* Şifreler */}
              <div style={{display: 'flex', gap: '15px'}}>
                <div className="auth-input-group" style={{flex: 1}}>
                    <label className="auth-label">Şifre</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>
                <div className="auth-input-group" style={{flex: 1}}>
                    <label className="auth-label">Şifre Tekrar</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="auth-input"
                            placeholder="••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>
              </div>

              {/* KVKK */}
              <div className="auth-options">
                <label className="remember-me" style={{cursor:'pointer'}}>
                  <input
                    type="checkbox"
                    checked={hasAgreedToKvkk}
                    onChange={(e) => setHasAgreedToKvkk(e.target.checked)}
                  />
                  <span>KVKK metnini okudum, onaylıyorum.</span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'İşleniyor...' : 'Kayıt Ol'}
              </button>
            </form>
        )}

        {/* --- ADIM 2: DOĞRULAMA FORMU --- */}
        {step === 2 && (
            <form onSubmit={handleVerify}>
                <div style={{textAlign: 'center', marginBottom: '20px', color: '#555'}}>
                    <CheckCircle size={50} color="#10b981" style={{marginBottom:'10px'}} />
                    <p>
                        <strong>{email}</strong> adresine 6 haneli bir doğrulama kodu gönderdik.
                    </p>
                    <p style={{fontSize: '0.9rem'}}>
                        Lütfen kodu aşağıya giriniz.
                    </p>
                </div>

                <div className="auth-input-group">
                    <label className="auth-label">Doğrulama Kodu</label>
                    <div className="input-wrapper">
                        <Key className="input-icon" />
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="auth-input"
                            placeholder="Kod (Örn: 123456)"
                            maxLength={6}
                            required
                            style={{textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem'}}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Kontrol Ediliyor...' : 'Doğrula ve Bitir'}
                </button>
                
                <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="link-btn" 
                    style={{marginTop: '15px', width: '100%'}}
                >
                    E-posta adresini yanlış mı girdin? Geri Dön
                </button>
            </form>
        )}

        {/* Footer (Sadece Step 1'de görünsün) */}
        {step === 1 && (
            <div className="auth-footer">
              <p>
                Zaten hesabınız var mı?{' '}
                <button onClick={() => navigate('/login')} className="link-btn">
                  Giriş Yap
                </button>
              </p>
            </div>
        )}

      </div>
    </div>
  );
}

export default RegisterPage;