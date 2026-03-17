/* Konum: src/components/admin/AdminDashboard.jsx */
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; 
import { Users, BookOpen, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLogs: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/api/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error("İstatistik hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    // Kart Bileşeni
    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-4 rounded-lg ${colorClass} text-white`}>
                <Icon size={28} />
            </div>
        </div>
    );

    if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel Özeti</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} icon={Users} colorClass="bg-blue-500" />
                <StatCard title="Toplam Gezi Notu" value={stats.totalLogs} icon={BookOpen} colorClass="bg-green-500" />
                <StatCard title="Sistem Durumu" value="Aktif" icon={Activity} colorClass="bg-purple-500" />
            </div>
        </div>
    );
};

export default AdminDashboard;