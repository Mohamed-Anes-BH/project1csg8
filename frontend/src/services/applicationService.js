import api from './api';

/**
 * Service de gestion des candidatures
 */
const applicationService = {
    /**
     * Obtenir la liste des candidatures
     * (étudiant: ses candidatures, entreprise: candidatures reçues)
     */
    getApplications: async (params = {}) => {
        const response = await api.get('/applications/', { params });
        return response.data;
    },

    /**
     * Postuler à une offre
     */
    apply: async (offerId) => {
        const response = await api.post('/applications/apply/', { offer_id: offerId });
        return response.data;
    },

    /**
     * Retirer une candidature
     */
    withdrawApplication: async (applicationId) => {
        const response = await api.delete(`/applications/${applicationId}/`);
        return response.data;
    },

    /**
     * Obtenir le détail d'une candidature
     */
    getApplicationById: async (applicationId) => {
        const response = await api.get(`/applications/${applicationId}/`);
        return response.data;
    },

    /**
     * Mettre à jour le statut d'une candidature (entreprise)
     */
    updateApplicationStatus: async (applicationId, status, internalNote = null) => {
        const data = {};
        if (status !== null && status !== undefined) {
            data.status = status;
        }
        if (internalNote !== null && internalNote !== undefined) {
            data.internal_note = internalNote;
        }
        const response = await api.patch(`/applications/${applicationId}/status/`, data);
        return response.data;
    },

    /**
     * Obtenir les statistiques des candidatures
     */
    getApplicationStats: async () => {
        const response = await api.get('/applications/stats/');
        return response.data;
    },

    /**
     * Obtenir les candidatures de l'entreprise avec filtres
     */
    getCompanyApplications: async (params = {}) => {
        const response = await api.get('/companies/applications/', { params });
        return response.data;
    }
};

export default applicationService;
