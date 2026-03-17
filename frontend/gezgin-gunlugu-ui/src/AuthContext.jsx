/* Konum: frontend/gezgin-gunlugu-ui/src/AuthContext.jsx */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from './api/apiClient';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // 1. GÜNCELLEME: Başlangıçta hem LocalStorage hem SessionStorage kontrol edilir
  const [token, setToken] = useState(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  
  const [user, setUser] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false);

  // 2. GÜNCELLEME: login fonksiyonuna 'rememberMe' parametresi eklendi
  const login = useCallback((newToken, rememberMe = false) => {
    setToken(newToken);

    if (rememberMe) {
      // Beni Hatırla SEÇİLİ: LocalStorage (Kalıcı)
      localStorage.setItem('token', newToken);
      sessionStorage.removeItem('token'); // Çakışma olmasın diye diğerini sil
    } else {
      // Beni Hatırla SEÇİLİ DEĞİL: SessionStorage (Sekme kapanınca gider)
      sessionStorage.setItem('token', newToken);
      localStorage.removeItem('token'); // Çakışma olmasın diye diğerini sil
    }
  }, []);

  // 3. GÜNCELLEME: logout hem local hem session storage'ı temizler
  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    if (token) {
      // --- Token VAR ---
      
      // NOT: Burada 'localStorage.setItem' satırını kaldırdık.
      // Çünkü kaydetme işini artık yukarıdaki 'login' fonksiyonu yönetiyor.
      // Burası sadece token varsa header ayarlarını ve decode işlemini yapar.

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const decodedToken = jwtDecode(token);
        
        const roleClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const firstNameClaim = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
        const lastNameClaim = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];

        let roles = [];
        if (Array.isArray(roleClaim)) {
          roles = roleClaim;
        } else if (roleClaim) {
          roles = [roleClaim];
        }

        setUser({
          id: decodedToken.sub,
          email: decodedToken.email,
          firstName: firstNameClaim,
          lastName: lastNameClaim,
          roles: roles
        });

        setIsAdmin(roles.includes('Admin'));
        
      } catch (error) {
        console.error("Geçersiz token, çıkış yapılıyor:", error);
        logout();
      }

    } else {
      // --- Token YOK ---
      delete apiClient.defaults.headers.common['Authorization'];
      // State temizliğini logout zaten yapıyor ama garanti olsun diye state'leri sıfırlayalım
      setUser(null);
      setIsAdmin(false);
    }

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("API 401: Token süresi doldu. Çıkış yapılıyor.");
          logout();
          // Eğer zaten login sayfasında değilsek yönlendir
          if (window.location.pathname !== '/login') {
             // window.location.href yerine navigate kullanmak daha iyi ama 
             // burada context içindeyiz, bu yöntem de çalışır.
             window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor);
    };
    
  }, [token, logout]); 

  const value = {
    token,
    user,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};