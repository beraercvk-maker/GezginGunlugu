    /* Konum: src/services/authService.js */

import apiClient from '../api/apiClient'; // <-- Yolu düzelttik

// 1. Şifremi Unuttum (Mail Gönderme)
export const forgotPassword = async (email) => {
    // Backend'e { email: "..." } gönderir
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
};

// 2. Şifre Yenileme (Yeni Şifre Belirleme)
export const resetPassword = async (data) => {
    // data şunları içerir: { email, token, newPassword }
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
};