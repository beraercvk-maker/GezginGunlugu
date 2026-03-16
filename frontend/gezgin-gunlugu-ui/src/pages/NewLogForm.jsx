import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
// CSS dosyan varsa aktif bırak
import '../NewLogForm.css';
import { X, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import LocationPicker from '../components/LocationPicker'; 

const API_BASE_URL = 'http://localhost:5252';

function NewLogForm() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id'); 
  const isEditMode = Boolean(id); 
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [rating, setRating] = useState('5');

  // Harita Koordinatları
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode); 

  const fileInputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  // --- KOORDİNAT DÜZELTME FONKSİYONU ---
  // Veritabanındaki "410043..." gibi sayıları "41.0043" haline getirir.
  const normalizeCoordinate = (value, maxLimit) => {
      let val = parseFloat(value);
      if (isNaN(val) || val === 0) return null;
      // Sayı mantıksız derecede büyükse (örn: 90'dan büyük enlem), 10'a bölmeye devam et
      while (Math.abs(val) > maxLimit) {
          val = val / 10;
      }
      return val;
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchLogData = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get(`/api/travellogs/${id}`);
          const log = response.data;
          
          if (!log) throw new Error("Günlük bulunamadı");

          setTitle(log.title || '');
          setContent(log.content || '');
          setLocation(log.location || '');
          
          // Tarihleri güvenli şekilde çevir
          if (log.travelDate) setTravelDate(new Date(log.travelDate).toISOString().split('T')[0]);
          if (log.entryDate) setEntryDate(new Date(log.entryDate).toISOString().split('T')[0]);
          
          setRating(log.rating ? log.rating.toString() : '5');
          
          // --- KRİTİK DÜZELTME: Koordinatları Normalleştir ---
          if (log.latitude) setLatitude(normalizeCoordinate(log.latitude, 90));
          if (log.longitude) setLongitude(normalizeCoordinate(log.longitude, 180));

          // Resimler (Backend artık obje listesi dönüyor: [{id, url}, ...])
          if (log.images && Array.isArray(log.images)) {
            setExistingImages(log.images);
          }
        } catch (err) {
          console.error("Yükleme hatası:", err);
          setError('Veri yüklenirken hata: ' + (err.message || "Bilinmeyen hata"));
        } finally {
          setLoading(false);
        }
      };
      fetchLogData();
    }
  }, [id, isEditMode]);

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newImagesWithPreview = filesArray.map(file => ({
        file: file,
        previewUrl: URL.createObjectURL(file)
      }));
      setNewImages(prev => [...prev, ...newImagesWithPreview]);
      e.target.value = null;
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const newList = [...prev];
      URL.revokeObjectURL(newList[index].previewUrl);
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm("Bu resmi silmek istediğinize emin misiniz?")) return;

    try {
        await apiClient.delete(`/api/travellogs/images/${imageId}`);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
        alert("Resim silinirken hata oluştu: " + err.message);
    }
  };

  const handleDeleteLog = () => {
    Swal.fire({
      title: 'Günlüğü Sil?',
      text: "Bu günlüğü tamamen silmek üzeresiniz. Bu işlem geri alınamaz!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'Vazgeç'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setSubmitting(true);
          await apiClient.delete(`/api/travellogs/${id}`);
          await Swal.fire('Silindi!', 'Günlük başarıyla silindi.', 'success');
          navigate('/logs'); 
        } catch (err) {
          Swal.fire('Hata!', 'Silme işlemi sırasında bir hata oluştu.', 'error');
          setSubmitting(false);
        }
      }
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setSubmitting(true);
    setError(null);

    const formattedTravelDate = travelDate ? `${travelDate}T00:00:00` : new Date().toISOString();
    const formattedEntryDate = entryDate ? `${entryDate}T00:00:00` : new Date().toISOString();

    try {
      // POST işlemi için FormData kullanıyoruz (Resim yükleme destekler)
      const formData = new FormData();
      formData.append('Title', title);
      formData.append('Content', content);
      formData.append('Location', location);
      formData.append('TravelDate', formattedTravelDate);
      formData.append('EntryDate', formattedEntryDate);
      formData.append('Rating', rating);
      
      // Koordinatları ekle (Varsa)
      if (latitude && longitude) {
        // String'e çevirip gönderiyoruz, C# (backend) bunu double olarak okuyacak
        // Önemli: Nokta (.) ondalık ayırıcı olmalı. JS zaten böyle yapar.
        formData.append('Latitude', latitude.toString());
        formData.append('Longitude', longitude.toString());
      }
      
      // Yeni resimler
      if (newImages.length > 0) {
        newImages.forEach((imgObj) => {
            formData.append('ImageFiles', imgObj.file);
        });
      }

      if (isEditMode) {
        // PUT isteği: Backend'de [FromBody] TravelLog beklediği için JSON göndermemiz gerekebilir.
        // Ancak resim yüklemek için FormData lazım.
        // Backend yapısı gereği şu an PUT ile resim yüklenemiyor olabilir (Controller koduna göre).
        // Bu yüzden sadece metinleri güncelliyoruz.
        
        const logData = {
            id: parseInt(id),
            title, content, location, 
            travelDate: formattedTravelDate, 
            entryDate: formattedEntryDate, 
            rating: parseInt(rating),
            latitude: latitude,
            longitude: longitude,
            // Images: [] // Mevcut resimler backend tarafından korunmalı
        };

        await apiClient.put(`/api/travellogs/${id}`, logData);
        
        // Eğer düzenlerken yeni resim eklenmişse, kullanıcıya uyarı verebiliriz
        // veya Backend'de PUT metodunu da [FromForm] yapman gerekir.
        // Şimdilik sadece metin güncellemesi yapıyoruz.
      } else {
        // POST İsteği (Yeni Kayıt)
        await apiClient.post('/api/travellogs', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      navigate('/logs'); 
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors) 
        : err.message;
      setError('Hata: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-5 text-xl">Yükleniyor...</p>;

  return (
    <div className="form-container">
      <h2>{isEditMode ? 'Günlüğü Düzenle' : 'Yeni Günlük Ekle'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Başlık</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>İçerik</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} required rows={5} />
        </div>

        <div className="form-group">
          <label>Konum Adı</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>

        {/* HARİTA BİLEŞENİ */}
        <div className="form-group">
            <label>Harita Konumu</label>
            <div style={{height: '300px', width: '100%', marginBottom: '10px'}}>
                 {/* LocationPicker, null değer gelirse varsayılan bir yeri gösterir, çökmez */}
                <LocationPicker 
                    lat={latitude} 
                    lng={longitude} 
                    onLocationSelect={handleLocationSelect} 
                />
            </div>
            {latitude && longitude && (
                 <small style={{color: '#666'}}>Seçilen: {latitude.toFixed(6)}, {longitude.toFixed(6)}</small>
            )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap:'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth:'200px' }}>
                <label>Seyahat Tarihi</label>
                <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} max={today} required />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth:'200px' }}>
                <label>Giriş Tarihi</label>
                <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} max={today} required />
            </div>
        </div>

        <div className="form-group">
          <label>Puan (1-5)</label>
          <select value={rating} onChange={e => setRating(e.target.value)} style={{width:'100%', padding:'0.75rem', border:'1px solid #ddd', borderRadius:'4px'}}>
            <option value="5">5 - Harika</option>
            <option value="4">4 - İyi</option>
            <option value="3">3 - Orta</option>
            <option value="2">2 - Eh işte</option>
            <option value="1">1 - Kötü</option>
          </select>
        </div>

        {/* FOTOĞRAFLAR */}
        <div className="form-group">
            <label>Fotoğraflar</label>
            <div className="image-upload-grid">
                {/* Mevcut Resimler */}
                {existingImages.map((img) => (
                    <div key={img.id} className="image-preview-box">
                        <img src={`${API_BASE_URL}${img.url}`} alt="Mevcut" onError={(e) => e.target.style.display='none'} />
                        <button type="button" className="remove-btn" onClick={() => handleRemoveExistingImage(img.id)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* Yeni Seçilenler */}
                {newImages.map((imgObj, index) => (
                    <div key={index} className="image-preview-box new-image">
                        <img src={imgObj.previewUrl} alt="Yeni" />
                        <button type="button" className="remove-btn" onClick={() => removeNewImage(index)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* Sadece yeni eklemede veya edit modunda resim ekleme butonu */}
                <div className="add-image-box" onClick={triggerFileInput}>
                    <Plus size={32} color="#666" />
                    <span>Ekle</span>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{ display: 'none' }} 
                    accept="image/*"
                    multiple 
                    onChange={handleFileSelect}
                />
            </div>
            {isEditMode && newImages.length > 0 && (
                <small style={{color:'#f59e0b', marginTop:'5px', display:'block'}}>
                    Not: Düzenleme modunda yeni eklenen resimler şu an için kaydedilmeyebilir (Backend güncellemesi gerekir).
                </small>
            )}
        </div>
        
        {error && <p className="error-msg" style={{color:'red', background:'#ffe4e6', padding:'10px', borderRadius:'5px'}}>{error}</p>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="form-button" disabled={submitting} style={{ flex: 1 }}>
              {isEditMode ? 'Değişiklikleri Kaydet' : 'Günlüğü Kaydet'}
            </button>

            {isEditMode && (
                <button 
                    type="button" 
                    className="form-button" 
                    onClick={handleDeleteLog}
                    disabled={submitting}
                    style={{ flex: 1, backgroundColor: '#dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                >
                    <Trash2 size={18} /> Sil
                </button>
            )}
        </div>
      </form>
    </div>
  );
}

export default NewLogForm;