import axios from 'axios';

// Backend adresin (Port 5252)
const apiClient = axios.create({ 
  baseURL: 'http://localhost:5252', 
  headers: {
    'Content-Type': 'application/json', // JSON formatında veri gönderiyoruz
  },
});

// --- DÜZELTİLEN KISIM ---
apiClient.interceptors.request.use(
  (config) => {
    // 1. Önce LocalStorage'a bak
    let token = localStorage.getItem('token');

    // 2. Orada yoksa SessionStorage'a bak (Senin durumunda burada çıkacak)
    if (!token) {
        token = sessionStorage.getItem('token');
    }

    // 3. Token bulduysan mektubun içine koy
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;