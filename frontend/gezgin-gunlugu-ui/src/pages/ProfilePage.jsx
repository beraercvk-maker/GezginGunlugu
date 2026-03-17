import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import './ProfilePage.css';
import { User, Lock, Save, AlertCircle, CheckCircle, Camera, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5252';

function ProfilePage() {
  // --- State'ler ---
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    profileImageUrl: null // Mevcut profil resmi URL'i
  });

  // Yeni seçilen resim dosyası ve önizlemesi
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [message, setMessage] = useState(null); 
  const fileInputRef = useRef(null);

  // --- Veri Çekme ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/auth/profile');
        const data = response.data;
        
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
          // Backend'den gelen resim URL'ini al (Eğer varsa)
          profileImageUrl: data.profileImageUrl || null
        });
      } catch (err) {
        console.error("Profil yüklenirken hata:", err);
        setMessage({ type: 'error', text: 'Profil bilgileri yüklenemedi.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- Dosya Seçimi ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Önizleme oluştur
    }
  };

  // --- Dosya Seçim Penceresini Aç ---
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // --- Profil Güncelleme (FormData Kullanarak) ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);

    try {
      // JSON yerine FormData kullanıyoruz çünkü dosya gönderiyoruz
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('phoneNumber', profile.phoneNumber);
      if (profile.birthDate) {
          formData.append('birthDate', new Date(profile.birthDate).toISOString());
      }
      
      // Eğer yeni resim seçildiyse onu da ekle
      if (newProfileImage) {
        formData.append('profileImage', newProfileImage);
      }

      // Content-Type header'ını axios otomatik ayarlar (multipart/form-data)
      const response = await apiClient.put('/api/auth/profile', formData, {
          headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Başarılı olursa backend'den gelen güncel URL'i kaydet
      if (response.data && response.data.profileImageUrl) {
          setProfile(prev => ({ ...prev, profileImageUrl: response.data.profileImageUrl }));
      }
      
      // Yeni resim seçimi state'lerini temizle
      setNewProfileImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      setMessage({ type: 'success', text: 'Profil bilgileri ve fotoğraf başarıyla güncellendi.' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors) 
        : (err.message || 'Güncelleme sırasında hata oluştu.');
      setMessage({ type: 'error', text: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Şifre Değiştirme (Aynı Kaldı) ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setMessage(null);

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler birbiriyle uyuşmuyor.' });
      setSavingPassword(false);
      return;
    }

    try {
      await apiClient.post('/api/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmNewPassword: passwords.confirmNewPassword
      });
      
      setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ') 
        : 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  // Profil Resmi URL Belirleme
  // Öncelik: 1. Yeni seçilen önizleme, 2. Backend'den gelen URL, 3. Varsayılan placeholder
  const displayImageUrl = previewUrl 
    ? previewUrl 
    : (profile.profileImageUrl ? `${API_BASE_URL}${profile.profileImageUrl}` : null);

  return (
    <div className="profile-container">
      
      <div className="profile-header">
        <User size={32} color="#3b82f6" />
        <h2>Profil Ayarları</h2>
      </div>

      {message && (
        <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* --- BÖLÜM 1: Profil Bilgileri --- */}
      <div className="profile-card">
        <h3 className="section-title"><User size={20} /> Kişisel Bilgiler</h3>
        
        <form onSubmit={handleProfileUpdate}>
          
          {/* --- YENİ EKLENEN KISIM: Profil Fotoğrafı Alanı --- */}
          <div className="profile-image-section" style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'20px'}}>
             <div 
                className="profile-image-wrapper" 
                style={{width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', border:'3px solid #e2e8f0', position:'relative', marginBottom:'10px'}}
             >
                {displayImageUrl ? (
                    <img 
                        src={displayImageUrl} 
                        alt="Profil" 
                        style={{width:'100%', height:'100%', objectFit:'cover'}} 
                        onError={(e) => e.target.style.display = 'none'}
                    />
                ) : (
                    <div style={{width:'100%', height:'100%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <User size={64} color="#cbd5e1" />
                    </div>
                )}
             </div>
             
             <button 
                type="button" 
                onClick={triggerFileInput}
                style={{display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', fontSize:'0.9rem', cursor:'pointer', border:'1px solid #cbd5e1', borderRadius:'5px', background:'#fff'}}
             >
                <Camera size={16} /> Fotoğrafı Değiştir
             </button>
             
             {/* Gizli Dosya Inputu */}
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{display:'none'}} 
             />
          </div>
          {/* ------------------------------------------------ */}

          <div className="profile-form-grid">
            <div className="profile-input-group">
              <label>Ad</label>
              <input 
                type="text" 
                className="profile-input"
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                required
              />
            </div>
            <div className="profile-input-group">
              <label>Soyad</label>
              <input 
                type="text" 
                className="profile-input"
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                required
              />
            </div>
            <div className="profile-input-group">
              <label>E-posta (Değiştirilemez)</label>
              <input 
                type="email" 
                className="profile-input" 
                value={profile.email} 
                disabled 
                style={{backgroundColor: '#e2e8f0', cursor: 'not-allowed'}}
              />
            </div>
            <div className="profile-input-group">
              <label>Telefon</label>
              <input 
                type="tel" 
                className="profile-input"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
              />
            </div>
            <div className="profile-input-group form-full-width">
              <label>Doğum Tarihi</label>
              <input 
                type="date" 
                className="profile-input"
                value={profile.birthDate}
                onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="profile-btn" disabled={savingProfile}>
              <Save size={18} />
              {savingProfile ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
            </button>
          </div>
        </form>
      </div>

      {/* --- BÖLÜM 2: Şifre Değiştirme (Aynı Kaldı) --- */ }
      <div className="profile-card">
        <h3 className="section-title"><Lock size={20} /> Şifre Değiştir</h3>
        
        <form onSubmit={handlePasswordChange}>
          <div className="profile-input-group">
            <label>Mevcut Şifre</label>
            <input 
              type="password" 
              className="profile-input"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
              required
            />
          </div>
          <div className="profile-form-grid">
            <div className="profile-input-group">
              <label>Yeni Şifre</label>
              <input 
                type="password" 
                className="profile-input"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <div className="profile-input-group">
              <label>Yeni Şifre (Tekrar)</label>
              <input 
                type="password" 
                className="profile-input"
                value={passwords.confirmNewPassword}
                onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="profile-btn btn-danger" disabled={savingPassword}>
              <Lock size={18} />
              {savingPassword ? 'İşleniyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default ProfilePage;