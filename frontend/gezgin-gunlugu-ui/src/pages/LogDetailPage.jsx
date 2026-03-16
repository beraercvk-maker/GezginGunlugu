import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
// Servis dosyanı import et (Yolunun doğru olduğundan emin ol)
import interactionService from '../services/interactionService';

// CSS dosyan
import './LogDetailPage.css'; 

// İkonlar
import { MapPin, Calendar, Star, ArrowLeft, User, Clock, Image as ImageIcon, Heart, MessageCircle, Trash2, Send } from 'lucide-react';

// Harita Kütüphaneleri
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Leaflet İkon düzeltmesi
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE_URL = 'http://localhost:5252';

function LogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE TANIMLARI ---
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Etkileşim State'leri
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // --- SAYFA YÜKLENİNCE ÇALIŞACAK KOD ---
  useEffect(() => {
    const fetchLogAndInteractions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Günlük Detayını Çek
        const response = await apiClient.get(`/api/travellogs/${id}`);
        if (response.data) {
            setLog(response.data);
        } else {
            setError("Veri boş döndü.");
        }

        // 2. Yorumları Çek
        try {
            const commentsRes = await interactionService.getComments(id);
            setComments(commentsRes.data);
        } catch (err) {
            console.log("Yorumlar çekilemedi:", err);
        }

        // 3. Beğeni Durumunu Çek (Backend'de /status endpointi varsa)
        // Yoksa sadece sayıyı çeker, kalp gri başlar.
        try {
            // Eğer interactionService.js içinde getInteractionStatus varsa:
            if (interactionService.getInteractionStatus) {
                const statusRes = await interactionService.getInteractionStatus(id);
                setLikeCount(statusRes.data.count || statusRes.data.Count || 0);
                setIsLiked(statusRes.data.isLiked || statusRes.data.IsLiked || false);
            } else {
                // Yoksa eski usül sadece sayıyı çek
                const likeRes = await interactionService.getLikeCount(id);
                setLikeCount(likeRes.data.count);
            }
        } catch (err) {
            console.log("Beğeni durumu çekilemedi (Giriş yapılmamış olabilir):", err);
        }

      } catch (err) {
        console.error("Genel yükleme hatası:", err);
        setError("Günlük yüklenemedi. Backend çalışıyor mu?");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchLogAndInteractions();
  }, [id]);

  // --- FONKSİYONLAR ---

  // 1. BEĞENİ FONKSİYONU
  const handleLike = async () => {
    // Token kontrolü
    const token = localStorage.getItem("token")|| sessionStorage.getItem("token");; // Login'de ne isimle kaydettiysen buraya onu yaz ("jwt" olabilir)
    if (!token) {
        alert("Beğeni göndermek için lütfen giriş yapınız.");
        return;
    }

    // Optimistic UI: Backend cevabını beklemeden ekranı güncelle (Hız hissi için)
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
        // Backend'e isteği at
        await interactionService.toggleLike(id);
        
        // Garanti olsun diye sunucudan son sayıyı tekrar iste
        if (interactionService.getInteractionStatus) {
            const res = await interactionService.getInteractionStatus(id);
            setLikeCount(res.data.count || res.data.Count);
            setIsLiked(res.data.isLiked || res.data.IsLiked);
        }
    } catch (error) {
        // Hata olursa eski haline döndür
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        alert("İşlem başarısız. Oturum süreniz dolmuş olabilir.");
    }
  };

  // 2. YORUM YAPMA FONKSİYONU
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token")|| sessionStorage.getItem("token");
    if (!token) {
        alert("Yorum yapmak için giriş yapmalısınız.");
        return;
    }

    try {
        await interactionService.addComment(id, newComment);
        setNewComment(""); // Kutuyu temizle
        
        // Listeyi güncelle
        const res = await interactionService.getComments(id);
        setComments(res.data);
    } catch (error) {
        console.error(error);
        alert("Yorum gönderilemedi.");
    }
  };

  // 3. YORUM SİLME FONKSİYONU
  const handleDeleteComment = async (commentId) => {
    if(!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

    try {
        await interactionService.deleteComment(commentId);
        // Silineni listeden çıkar
        setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
        alert("Yorum silinemedi. Bu yorum size ait olmayabilir.");
    }
  };

  // --- YARDIMCI FONKSİYONLAR ---
  const normalizeCoordinate = (value, maxLimit) => {
      let val = parseFloat(value);
      if (isNaN(val) || val === 0) return null;
      while (Math.abs(val) > maxLimit) {
          val = val / 10;
      }
      return val;
  };

  const formatDate = (dateString) => {
      try {
          if (!dateString) return 'Tarih Yok';
          return new Date(dateString).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) {
          return 'Geçersiz Tarih';
      }
  };

  // --- YÜKLENİYOR / HATA EKRANLARI ---
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-lg">Yükleniyor...</div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <h3>Hata: {error}</h3>
        <button onClick={() => navigate('/logs')} className="mt-4 px-4 py-2 border rounded">Listeye Dön</button>
    </div>
  );

  if (!log) return null;

  // --- VERİ HAZIRLIĞI ---
  const authorName = log.userName || 'Bilinmeyen Kullanıcı';
  const lat = normalizeCoordinate(log.latitude, 90);
  const lng = normalizeCoordinate(log.longitude, 180);
  const showMap = (lat !== null && lng !== null);

  // --- RENDER (GÖRÜNÜM) ---
  return (
    <div className="detail-page-wrapper">
      <button onClick={() => navigate(-1)} className="back-btn" style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', border:'none', background:'transparent', fontSize:'16px'}}>
        <ArrowLeft size={20} /> Geri Dön
      </button>

      <div className="detail-container">
        {/* Kapak Görseli */}
        {log.images && log.images.length > 0 ? (
           <img 
             src={`${API_BASE_URL}${log.images[0].url}`} 
             alt={log.title} 
             className="detail-header-image"
             style={{width:'100%', maxHeight:'400px', objectFit:'cover', borderRadius:'12px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}
             onError={(e) => { e.target.style.display = 'none'; }}
           />
        ) : (
           <div style={{height:'200px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px'}}>
             <ImageIcon size={48} color="#cbd5e1"/>
             <span style={{marginLeft:'10px', color:'#94a3b8'}}>Görsel Yok</span>
           </div>
        )}

        <div className="detail-content" style={{marginTop:'25px', padding:'0 10px'}}>
          
          {/* Başlık ve Beğeni Butonu */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap'}}>
             <h1 style={{fontSize:'2.5rem', fontWeight:'800', marginBottom:'15px', color:'#1e293b'}}>{log.title}</h1>
             
             <button 
                onClick={handleLike}
                style={{
                    display:'flex', alignItems:'center', gap:'8px', 
                    background: isLiked ? '#fee2e2' : '#f1f5f9', 
                    border:'none', padding:'10px 20px', borderRadius:'30px', 
                    cursor:'pointer', transition:'all 0.2s',
                    color: isLiked ? '#ef4444' : '#64748b',
                    fontWeight:'600'
                }}
             >
                <Heart size={24} fill={isLiked ? "#ef4444" : "none"} />
                <span>{likeCount} Beğeni</span>
             </button>
          </div>

          {/* Meta Bilgiler */}
          <div className="detail-meta-grid" style={{display:'flex', gap:'20px', color:'#64748b', marginBottom:'25px', flexWrap:'wrap', fontSize:'0.95rem'}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <MapPin size={18} className="text-red-500" /> <span style={{fontWeight:'500'}}>{log.location}</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <Calendar size={18} className="text-blue-500" /> <span>{formatDate(log.travelDate)}</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <Star size={18} fill="#fbbf24" color="#fbbf24"/> <span style={{fontWeight:'600', color:'#475569'}}>{log.rating}/5</span>
            </div>
          </div>

          <h2 style={{fontSize:'2.5rem', fontWeight:'800', marginBottom:'15px', color:'#1e293b'}}>Açıklama</h2>
          <div className="detail-description" style={{lineHeight:'1.8', fontSize:'1.1rem', color:'#334155', whiteSpace:'pre-wrap'}}>
            {log.content}
          </div>

          {/* Harita */}
          {showMap ? (
            <div style={{marginTop:'40px', height:'350px', borderRadius:'12px', overflow:'hidden', border:'1px solid #e2e8f0', position:'relative', zIndex:0}}>
              <h3 style={{marginBottom:'10px', padding:'0 10px', fontSize:'1.2rem', fontWeight:'600'}}>Konum</h3>
              <MapContainer 
                  center={[lat, lng]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
              >
                  <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[lat, lng]}>
                      <Popup>{log.location}</Popup>
                  </Marker>
              </MapContainer>
            </div>
          ) : (
             <div style={{marginTop:'30px', padding:'20px', background:'#fff1f2', color:'#be123c', borderRadius:'8px', fontSize:'0.9rem'}}>
               ⚠️ Konum bilgisi eksik.
             </div>
          )}
          
          {/* Galeri */}
          {log.images && log.images.length > 1 && (
            <div style={{marginTop:'40px'}}>
              <h3 style={{fontSize:'1.2rem', fontWeight:'600', marginBottom:'15px'}}>Diğer Fotoğraflar</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'15px'}}>
                {log.images.slice(1).map((img) => (
                  <img 
                    key={img.id} 
                    src={`${API_BASE_URL}${img.url}`} 
                    alt="Galeri" 
                    style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'8px', cursor:'pointer', transition:'transform 0.2s'}}
                    onClick={() => window.open(`${API_BASE_URL}${img.url}`, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- YORUMLAR BÖLÜMÜ --- */}
        <div style={{marginTop:'50px', padding:'30px', background:'#f8fafc', borderRadius:'12px'}}>
            <h3 style={{fontSize:'1.5rem', fontWeight:'700', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px'}}>
                <MessageCircle /> Yorumlar ({comments.length})
            </h3>

            {/* Yorum Kutusu */}
            <div style={{marginBottom:'30px', display:'flex', gap:'10px'}}>
                <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Bu gezi hakkında bir şeyler yaz..."
                    style={{
                        flex:1, padding:'15px', borderRadius:'8px', border:'1px solid #cbd5e1', 
                        minHeight:'80px', resize:'vertical', outline:'none'
                    }}
                />
                <button 
                    onClick={handleAddComment}
                    style={{
                        background:'#2563eb', color:'white', border:'none', borderRadius:'8px', 
                        padding:'0 25px', cursor:'pointer', fontWeight:'600', display:'flex', 
                        alignItems:'center', gap:'5px'
                    }}
                >
                    <Send size={18} /> Gönder
                </button>
            </div>

            {/* Yorum Listesi */}
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                {comments.length === 0 && <p style={{color:'#94a3b8', fontStyle:'italic'}}>Henüz yorum yok.</p>}
                
                {comments.map((comment) => (
                    <div key={comment.id} style={{background:'white', padding:'20px', borderRadius:'10px', border:'1px solid #e2e8f0'}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <div style={{width:'35px', height:'35px', background:'#e2e8f0', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <span style={{fontWeight:'700', color:'#334155', display:'block', fontSize:'0.95rem'}}>
                                        {comment.userName || 'Misafir'}
                                    </span>
                                    <span style={{fontSize:'0.8rem', color:'#94a3b8'}}>
                                        {new Date(comment.createdDate).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{background:'transparent', border:'none', color:'#ef4444', cursor:'pointer'}}
                                title="Yorumu Sil"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <p style={{color:'#475569'}}>{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
        {/* --- YORUMLAR BİTİŞ --- */}

        {/* Footer */}
        <div className="detail-footer" style={{marginTop:'50px', paddingTop:'20px', borderTop:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', color:'#94a3b8', fontSize:'0.85rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
            <User size={16} />
            <span>Yazar: <strong style={{color:'#64748b'}}>{authorName}</strong></span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
            <Clock size={16} />
            <span>Eklenme: <strong style={{color:'#64748b'}}>{formatDate(log.entryDate)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogDetailPage;