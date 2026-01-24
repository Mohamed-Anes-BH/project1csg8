import api from './api';

/**
 * Service de messagerie
 */
const messageService = {
    /**
     * Obtenir la liste des conversations
     */
    getConversations: async () => {
        const response = await api.get('/messaging/conversations/');
        return response.data;
    },

    /**
     * Obtenir les messages d'une conversation
     */
    getMessages: async (conversationId, params = {}) => {
        const response = await api.get(`/messaging/conversations/${conversationId}/messages/`, { params });
        return response.data;
    },

    /**
     * Envoyer un message
     */
    sendMessage: async (conversationId, content) => {
        const response = await api.post(`/messaging/conversations/${conversationId}/messages/`, { content });
        return response.data;
    },

    /**
     * Créer ou obtenir une conversation
     */
    getOrCreateConversation: async (otherUserId) => {
        const response = await api.post('/messaging/conversations/', { other_user_id: otherUserId });
        return response.data;
    }
};

/**
 * Service de notifications
 */
const notificationService = {
    /**
     * Obtenir la liste des notifications
     */
    getNotifications: async (params = {}) => {
        const response = await api.get('/notifications/', { params });
        return response.data;
    },

    /**
     * Marquer une notification comme lue
     */
    markAsRead: async (notificationId) => {
        const response = await api.patch(`/notifications/${notificationId}/read/`);
        return response.data;
    },

    /**
     * Marquer toutes les notifications comme lues
     */
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read/');
        return response.data;
    },

    /**
     * Supprimer une notification
     */
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/notifications/${notificationId}/`);
        return response.data;
    },

    /**
     * Supprimer toutes les notifications lues
     */
    deleteAllRead: async () => {
        const response = await api.delete('/notifications/');
        return response.data;
    },

    /**
     * Obtenir les statistiques des notifications
     */
    getNotificationStats: async () => {
        const response = await api.get('/notifications/stats/');
        return response.data;
    },

    /**
     * Obtenir les préférences de notification
     */
    getNotificationPreferences: async () => {
        const response = await api.get('/notifications/preferences/');
        return response.data;
    },

    /**
     * Mettre à jour les préférences de notification
     */
    updateNotificationPreferences: async (emailAlerts) => {
        const response = await api.patch('/notifications/preferences/', { email_alerts: emailAlerts });
        return response.data;
    }
};

export { messageService, notificationService };
