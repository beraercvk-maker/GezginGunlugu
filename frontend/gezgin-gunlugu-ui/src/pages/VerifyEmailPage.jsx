import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient'; 
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor, lütfen bekleyin...');

    useEffect(() => {
        // URL'den userId ve token'ı al
        const userId = searchParams.get('userId');
        const token = searchParams.get('token');

        if (!userId || !token) {
            setStatus('error');
            setMessage('Geçersiz doğrulama bağlantısı.');
            return;
        }

        const verifyEmail = async () => {
            try {
                // Token'ı backend'in anlayacağı formata çevirip gönderiyoruz
                await apiClient.get(`/api/auth/confirm-email?userId=${userId}&token=${encodeURIComponent(token)}`);
                
                setStatus('success');
                setMessage('E-postanız başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
                
                // 3 saniye sonra Giriş yap sayfasına at
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Doğrulama başarısız. Linkin süresi dolmuş veya zaten doğrulanmış olabilir.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            height: '100vh', background: '#f8fafc', padding: '20px', textAlign: 'center'
        }}>
            <div style={{
                background: 'white', padding: '40px', borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '450px', width: '100%'
            }}>
                
                {status === 'verifying' && (
                    <>
                        <Loader className="animate-spin" size={48} color="#3b82f6" style={{margin:'0 auto 20px'}} /> 
                        <h2 style={{color: '#1e293b'}}>Doğrulanıyor...</h2>
                        <p style={{color: '#64748b'}}>{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={64} color="#22c55e" style={{margin:'0 auto 20px'}} />
                        <h2 style={{color: '#15803d'}}>Başarılı!</h2>
                        <p style={{color: '#334155'}}>{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={64} color="#ef4444" style={{margin:'0 auto 20px'}} />
                        <h2 style={{color: '#b91c1c'}}>Hata!</h2>
                        <p style={{color: '#334155', marginBottom:'20px'}}>{message}</p>
                        <button 
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '10px 20px', background: '#3b82f6', color:'white', 
                                border:'none', borderRadius:'8px', cursor:'pointer', fontWeight: '600'
                            }}
                        >
                            Giriş Sayfasına Git
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;