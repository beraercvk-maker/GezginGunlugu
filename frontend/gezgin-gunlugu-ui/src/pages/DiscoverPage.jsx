import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
// Detay sayfasındaki şık ikonları buraya da getirdik
import { MapPin, User, Trophy, Calendar, Star, ArrowRight, Heart } from 'lucide-react';

function DiscoverPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5252';

  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        const response = await apiClient.get('/api/travellogs/discover');
        setLogs(response.data);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscover();
  }, []);

  // Tarih formatlamak için yardımcı fonksiyon
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#64748b', fontSize:'1.2rem'}}>
      Trendler yükleniyor...
    </div>
  );

  return (
    <div className="page-container" style={{ paddingTop: '100px', paddingBottom: '50px', maxWidth: '1200px', margin: '0 auto', paddingLeft:'20px', paddingRight:'20px' }}>
      
      {/* BAŞLIK ALANI - Detay sayfasındaki gibi temiz bir görünüm */}
      <div style={{
          textAlign:'center', 
          padding:'50px 20px', 
          background:'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
          borderRadius:'24px', 
          marginBottom:'40px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{color:'#0f172a', fontSize:'2.5rem', fontWeight:'800', display:'flex', justifyContent:'center', alignItems:'center', gap:'15px', marginBottom:'10px'}}>
          <Trophy size={40} className="text-yellow-500" fill="#f59e0b" color="#f59e0b" /> 
          Keşfet
        </h1>
        <p style={{color:'#64748b', fontSize:'1.1rem'}}>Gezginlerin bu hafta en çok beğendiği rotalar</p>
      </div>

      {/* KART LİSTESİ - Grid Yapısı */}
      <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', // Kartlar daha geniş ve ferah
          gap: '30px'
      }}>
        {logs.map((log, index) => (
          <div 
            key={log.id} 
            onClick={() => navigate(`/logs/${log.id}`)}
            style={{
                background: 'white',
                borderRadius: '20px', // Detay sayfasındaki gibi yumuşak köşeler
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Kaliteli gölge
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                border: '1px solid #f1f5f9'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
          >
             
             {/* SIRALAMA ROZETİ (Madalya gibi) */}
             <div style={{
                 position:'absolute', top:'15px', left:'15px', 
                 background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.9)',
                 color: index < 3 ? 'white' : '#0f172a',
                 padding:'8px 16px', borderRadius:'30px', fontWeight:'800', zIndex:2,
                 boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                 display:'flex', alignItems:'center', gap:'5px', fontSize:'0.9rem', backdropFilter: index > 2 ? 'blur(4px)' : 'none'
             }}>
                #{index + 1} {index === 0 && '👑'}
             </div>

            {/* GÖRSEL ALANI */}
            <div style={{height: '220px', width: '100%', background: '#cbd5e1', position:'relative'}}>
              {log.images && log.images.length > 0 ? (
                <img 
                    src={`${API_BASE_URL}${log.images[0].url}`} 
                    alt={log.title} 
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
              ) : (
                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                    Görsel Yok
                </div>
              )}
              {/* Resim üzerine overlay (gölge) */}
              <div style={{position:'absolute', bottom:0, left:0, width:'100%', height:'60px', background:'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'}}></div>
            </div>
            
            {/* İÇERİK ALANI */}
            <div style={{padding: '25px'}}>
              
              {/* Başlık */}
              <h3 style={{fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', marginBottom: '15px', lineHeight:'1.3'}}>
                {log.title}
              </h3>

              {/* Kullanıcı Bilgisi (Yazar) */}
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #f1f5f9'}}>
                 <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                    <User size={18} />
                 </div>
                 <span style={{fontSize:'0.95rem', fontWeight:'600', color:'#475569'}}>
                    {log.userName || 'Gizli Gezgin'}
                 </span>
              </div>

              {/* Meta Bilgiler (Konum, Tarih, Puan) */}
              <div style={{display:'flex', flexDirection:'column', gap:'10px', color:'#64748b', fontSize:'0.9rem'}}>
                 
                 <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <MapPin size={16} className="text-red-500" color="#ef4444" />
                    <span style={{fontWeight:'500'}}>{log.location}</span>
                 </div>

                 <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <Calendar size={16} color="#3b82f6" />
                        <span>{formatDate(log.travelDate)}</span>
                    </div>
                    
                    {/* Puanlama Yıldızı */}
                    {log.rating > 0 && (
                        <div style={{display:'flex', alignItems:'center', gap:'4px', background:'#fffbeb', padding:'4px 10px', borderRadius:'12px', color:'#b45309'}}>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span style={{fontWeight:'700'}}>{log.rating}</span>
                        </div>
                    )}
                 </div>

              </div>

              {/* Alt Buton */}
              <div style={{marginTop:'25px', display:'flex', justifyContent:'flex-end'}}>
                  <span style={{
                      color:'#2563eb', fontWeight:'600', fontSize:'0.95rem', 
                      display:'flex', alignItems:'center', gap:'5px'
                  }}>
                      İncele <ArrowRight size={18} />
                  </span>
              </div>

            </div>
          </div>
        ))}

        {logs.length === 0 && (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'60px', color:'#94a3b8', background:'white', borderRadius:'20px'}}>
                <h3 style={{fontSize:'1.5rem', marginBottom:'10px'}}>📭 Henüz Liste Boş</h3>
                <p>Bu hafta popüler olan bir gezi bulunamadı. İlk sen paylaş!</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default DiscoverPage;