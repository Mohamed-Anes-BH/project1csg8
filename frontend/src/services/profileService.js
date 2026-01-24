import api from './api';

/**
 * Service de gestion des profils
 */
const profileService = {
    // ============ PROFIL ÉTUDIANT ============

    /**
     * Obtenir le profil étudiant
     */
    getStudentProfile: async () => {
        const response = await api.get('/students/profile/');
        return response.data;
    },

    /**
     * Mettre à jour le profil étudiant
     */
    updateStudentProfile: async (data) => {
        const response = await api.put('/students/profile/', data);
        return response.data;
    },

    /**
     * Obtenir le profil public d'un étudiant
     */
    getPublicStudentProfile: async (studentId) => {
        const response = await api.get(`/students/profile/${studentId}/public/`);
        return response.data;
    },

    /**
     * Basculer la visibilité du profil (public/privé)
     */
    toggleStudentVisibility: async () => {
        const response = await api.patch('/students/visibility/');
        return response.data;
    },

    /**
     * Upload Avatar Student
     */
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('/students/upload-avatar/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Upload CV PDF
     */
    uploadCV: async (file) => {
        const formData = new FormData();
        formData.append('cv', file);

        const response = await api.post('/students/upload-cv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Supprimer le CV
     */
    deleteCV: async () => {
        const response = await api.delete('/students/upload-cv/');
        return response.data;
    },

    /**
     * Obtenir le dashboard étudiant
     */
    getStudentDashboard: async () => {
        const response = await api.get('/students/dashboard/');
        return response.data;
    },

    /**
     * Obtenir toutes les recommandations
     */
    getRecommendations: async () => {
        const response = await api.get('/students/recommendations/');
        return response.data;
    },

    /**
     * Obtenir les paramètres de l'étudiant
     */
    getStudentSettings: async () => {
        const response = await api.get('/students/settings/');
        return response.data;
    },

    /**
     * Mettre à jour les paramètres de l'étudiant
     */
    updateStudentSettings: async (data) => {
        const response = await api.patch('/students/settings/', data);
        return response.data;
    },

    // ============ PROFIL ENTREPRISE ============

    /**
     * Obtenir le profil entreprise
     */
    getCompanyProfile: async () => {
        const response = await api.get('/companies/profile/');
        return response.data;
    },

    /**
     * Mettre à jour le profil entreprise
     */
    updateCompanyProfile: async (data) => {
        const response = await api.put('/companies/profile/', data);
        return response.data;
    },

    /**
     * Obtenir le profil public d'une entreprise
     */
    getPublicCompanyProfile: async (companyId) => {
        const response = await api.get(`/companies/profile/${companyId}/public/`);
        return response.data;
    },

    /**
     * Upload logo entreprise
     */
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await api.post('/companies/upload-logo/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Supprimer le logo
     */
    deleteLogo: async () => {
        const response = await api.delete('/companies/upload-logo/');
        return response.data;
    },

    /**
     * Obtenir le dashboard entreprise
     */
    getCompanyDashboard: async () => {
        const response = await api.get('/companies/dashboard/');
        return response.data;
    },

    /**
     * Obtenir les paramètres de l'entreprise
     */
    getCompanySettings: async () => {
        const response = await api.get('/companies/settings/');
        return response.data;
    },

    /**
     * Mettre à jour les paramètres de l'entreprise
     */
    updateCompanySettings: async (data) => {
        const response = await api.patch('/companies/settings/', data);
        return response.data;
    },

    /**
     * Télécharger le CV d'un étudiant (entreprise)
     */
    downloadStudentCV: async (studentId) => {
        const response = await api.get(`/companies/download-cv/${studentId}/`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // ============ ALERTES EMAIL ============

    /**
     * Basculer les alertes email
     */
    toggleEmailAlerts: async () => {
        const response = await api.patch('/accounts/toggle-email-alerts/');
        return response.data;
    },

    /**
     * Obtenir le statut des alertes email
     */
    getEmailAlertsStatus: async () => {
        const response = await api.get('/accounts/toggle-email-alerts/');
        return response.data;
    }
};

export default profileService;
