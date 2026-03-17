import apiClient from '../api/apiClient';

// apiClient zaten Base URL'i (http://localhost:5252) biliyor.
// AuthContext de token'ı header'a otomatik ekliyor.
// Bizim sadece endpoint'in devamını yazmamız yeterli.

const interactionService = {
    // Yorum Ekle
    addComment: async (travelLogId, content) => {
        // Otomatik Token Gider
        return await apiClient.post('/api/interaction/comment', { travelLogId, content });
    },

    // Yorumları Getir
    getComments: async (travelLogId) => {
        return await apiClient.get(`/api/interaction/comments/${travelLogId}`);
    },

    // Yorum Sil
    deleteComment: async (commentId) => {
        // Otomatik Token Gider
        return await apiClient.delete(`/api/interaction/comment/${commentId}`);
    },

    // Beğen / Vazgeç
    toggleLike: async (travelLogId) => {
        // Otomatik Token Gider
        return await apiClient.post(`/api/interaction/like/${travelLogId}`, {});
    },

    // Beğeni Sayısını Getir
    getLikeCount: async (travelLogId) => {
        return await apiClient.get(`/api/interaction/like-count/${travelLogId}`);
    },

    // Beğeni Durumunu ve Sayısını Getir
    getInteractionStatus: async (travelLogId) => {
        // Otomatik Token Gider (Giriş yapılmışsa)
        return await apiClient.get(`/api/interaction/status/${travelLogId}`);
    }
};

export default interactionService;