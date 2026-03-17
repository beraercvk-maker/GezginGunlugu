import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './LogListPage.css'; 
import Swal from 'sweetalert2';
import { 
  Book, MapPin, Star, Calendar, Plus, 
  Search, Edit, Trash2, Image as ImageIcon,
  ArrowUpDown // YENİ: İkon eklendi
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5252';

function LogListPage() {
  const [originalLogs, setOriginalLogs] = useState([]); 
  const [filteredLogs, setFilteredLogs] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // --- 1. YENİ: Sıralama State'i ---
  const [sortOption, setSortOption] = useState('date-desc'); // Varsayılan: En Yeni Tarih

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Veri Çekme ---
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/travellogs');
      setOriginalLogs(response.data); 
      // İlk yüklemede filtrelemeyi useEffect halledecek, burayı boş geçebiliriz veya setleyebiliriz
      setFilteredLogs(response.data); 
      setError(null);
    } catch (err) {
      setError(err.message);
      setOriginalLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []); 

  // --- 2. GÜNCELLEME: Arama VE Filtreleme Mantığı ---
  useEffect(() => {
    // Orjinal veriyi kopyala
    let result = [...originalLogs];

    // A. Arama Filtresi
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(log =>
        log.title.toLowerCase().includes(lowerTerm) ||
        log.location.toLowerCase().includes(lowerTerm)
      );
    }

    // B. Sıralama Mantığı
    switch (sortOption) {
      case 'date-desc': // En Yeni Tarih (Azalan)
        result.sort((a, b) => new Date(b.travelDate) - new Date(a.travelDate));
        break;
      case 'date-asc': // En Eski Tarih (Artan)
        result.sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));
        break;
      case 'rating-desc': // En Yüksek Puan (Azalan)
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'rating-asc': // En Düşük Puan (Artan)
        result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      default:
        break;
    }

    setFilteredLogs(result); 
  }, [searchTerm, originalLogs, sortOption]); // sortOption değişince de çalışır

  // --- İstatistik Hesaplama ---
  const stats = {
    totalLogs: filteredLogs.length,
    uniqueLocations: new Set(filteredLogs.map(log => log.location)).size,
    averageRating: filteredLogs.length > 0 
      ? (filteredLogs.reduce((sum, log) => sum + (log.rating || 0), 0) / filteredLogs.length).toFixed(1)
      : 0
  };

  // --- Silme ---
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu günlüğü silmek istediğinize emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'Vazgeç'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/api/travellogs/${id}`);
          Swal.fire('Silindi!', 'Günlüğünüz silindi.', 'success');
          fetchLogs(); 
        } catch (err) {
          Swal.fire('Hata!', 'Silme işlemi başarısız.', 'error');
        }
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/new?id=${id}`);
  };

  const handleCreate = () => {
    navigate('/new');
  };

  const handleViewDetail = (id) => {
    navigate(`/logs/${id}`);
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div className="dashboard-container">
      
      {/* 1. İSTATİSTİK KARTLARI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Toplam Günlük</p>
            <h3 className="stat-value">{stats.totalLogs}</h3>
          </div>
          <div className="stat-icon-box icon-bg-blue">
            <Book size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Ziyaret Edilen Yer</p>
            <h3 className="stat-value">{stats.uniqueLocations}</h3>
          </div>
          <div className="stat-icon-box icon-bg-green">
            <MapPin size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Ortalama Puan</p>
            <h3 className="stat-value">{stats.averageRating}</h3>
          </div>
          <div className="stat-icon-box icon-bg-yellow">
            <Star size={24} />
          </div>
        </div>
      </div>

      {/* 2. FİLTRE VE BUTONLAR */}
      <div className="dashboard-actions" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
        
        {/* Arama Kutusu */}
        <div className="search-box" style={{flex: 1, minWidth: '200px'}}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Günlüklerde ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 3. YENİ: Sıralama Dropdown Menüsü */}
        <div className="sort-box" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
           <div style={{position: 'absolute', left: '10px', color: '#64748b', pointerEvents: 'none'}}>
              <ArrowUpDown size={16} />
           </div>
           <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: '10px 10px 10px 35px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#475569',
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
                height: '100%'
              }}
           >
              <option value="date-desc">En Yeni Tarih</option>
              <option value="date-asc">En Eski Tarih</option>
              <option value="rating-desc">En Yüksek Puan</option>
              <option value="rating-asc">En Düşük Puan</option>
           </select>
        </div>

        <button onClick={handleCreate} className="create-btn">
          <Plus size={20} />
          Yeni Günlük Ekle
        </button>
      </div>

      {/* 3. GÜNLÜK KARTLARI */}
      <div className="entries-grid">
        {filteredLogs.length === 0 ? (
          <div className="no-data">
            <Book size={48} style={{margin:'0 auto', color:'#cbd5e1', marginBottom:'1rem'}} />
            <h3>Henüz günlük eklenmemiş</h3>
            <p>Yeni bir macera eklemek için butona tıklayın.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
                key={log.id} 
                className="entry-card"
                onClick={() => handleViewDetail(log.id)}
                style={{cursor: 'pointer'}}
            >
              {/* Kapak Resmi */}
              <div className="entry-image-container">
                {log.images && log.images.length > 0 ? (
                  <img 
                    src={`${API_BASE_URL}${log.images[0].url}`} 
                    alt={log.title} 
                    className="entry-image"
                    onError={(e) => e.target.style.display = 'none'} 
                  />
                ) : (
                  <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1'}}>
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>

              {/* Kart İçeriği */}
              <div className="entry-content">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="entry-title">{log.title}</h3>
                </div>

                <div className="entry-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{log.location}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(log.travelDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>

                {/* Yıldızlar */}
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`star-icon ${i < (log.rating || 0) ? 'star-filled' : ''}`} 
                    />
                  ))}
                </div>

                <p className="entry-description">{log.content}</p>

                {/* Butonlar */}
                <div className="entry-actions">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(log.id); }} 
                    className="action-btn btn-edit-icon"
                    title="Düzenle"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }} 
                    className="action-btn btn-delete-icon"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogListPage;