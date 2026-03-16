import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext'; 
import apiClient from '../api/apiClient'; 
import AdminSidebar from '../components/AdminSidebar';
import { Users, BookOpen, Activity } from 'lucide-react';
// CSS Dosyasını çağırmayı unutma!
import './AdminPanelPage.css'; 

const AdminDashboard = () => {
    const { isAdmin, user } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, totalLogs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            apiClient.get('/api/admin/stats')
                .then(res => setStats(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isAdmin]);

    if (!isAdmin) return <div className="access-denied"><h2>Yetkiniz Yok</h2></div>;

    return (
        <div className="admin-layout">
            
            <AdminSidebar />

            <div className="admin-content">
                
                <div className="admin-header">
                    <p>Yönetim Paneli</p>
                    <h1>Dashboard</h1>
                </div>

                {loading ? <p>Yükleniyor...</p> : (
                    <>
                        {/* İstatistik Kartları Grid Yapısı */}
                        <div className="dashboard-grid">
                            
                            {/* Kart 1 */}
                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Toplam Kullanıcı</p>
                                    <h3>{stats.totalUsers}</h3>
                                </div>
                                <div className="stat-icon-box icon-bg-blue">
                                    <Users size={28} />
                                </div>
                            </div>

                            {/* Kart 2 */}
                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Toplam Gezi Notu</p>
                                    <h3>{stats.totalLogs}</h3>
                                </div>
                                <div className="stat-icon-box icon-bg-green">
                                    <BookOpen size={28} />
                                </div>
                            </div>

                            {/* Kart 3 */}
                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Sistem Durumu</p>
                                    <h3>Aktif</h3>
                                </div>
                                <div className="stat-icon-box icon-bg-purple">
                                    <Activity size={28} />
                                </div>
                            </div>

                        </div>

                        {/* Hoşgeldin Kutusu */}
                        <div className="welcome-card">
                            <h3>Hoş Geldin, {user?.firstName || 'Admin'}! 👋</h3>
                            <p>
                                Burası senin yönetim merkezin. Sol menüyü kullanarak kullanıcıları yönetebilir, 
                                istatistikleri inceleyebilir ve sistem ayarlarını değiştirebilirsin.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;