import api from './api';

/**
 * Service de gestion des offres
 */
const offerService = {
    /**
     * Obtenir la liste des offres avec filtres
     */
    getOffers: async (params = {}) => {
        const response = await api.get('/offers/', { params });
        return response.data;
    },

    /**
     * Obtenir le détail d'une offre
     */
    getOfferById: async (id) => {
        const response = await api.get(`/offers/${id}/`);
        return response.data;
    },

    /**
     * Créer une nouvelle offre
     */
    createOffer: async (data) => {
        const response = await api.post('/offers/', data);
        return response.data;
    },

    /**
     * Modifier une offre
     */
    updateOffer: async (id, data) => {
        const response = await api.put(`/offers/${id}/`, data);
        return response.data;
    },

    /**
     * Publier une offre (passer de brouillon à publié)
     */
    publishOffer: async (id) => {
        const response = await api.patch(`/offers/${id}/publish/`);
        return response.data;
    },

    /**
     * Archiver une offre
     */
    archiveOffer: async (id) => {
        const response = await api.patch(`/offers/${id}/archive/`);
        return response.data;
    },

    /**
     * Clôturer une offre
     */
    closeOffer: async (id) => {
        const response = await api.patch(`/offers/${id}/close/`);
        return response.data;
    },

    /**
     * Supprimer une offre (suppression logique)
     */
    deleteOffer: async (id) => {
        const response = await api.delete(`/offers/${id}/delete/`);
        return response.data;
    },

    /**
     * Dupliquer une offre
     */
    duplicateOffer: async (id) => {
        const response = await api.post(`/offers/${id}/duplicate/`);
        return response.data;
    },

    /**
     * Importer des offres depuis Excel
     */
    importOffersFromExcel: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/offers/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Obtenir les offres de l'entreprise connectée
     */
    getMyOffers: async (params = {}) => {
        const response = await api.get('/companies/my-offers/', { params });
        return response.data;
    },

    /**
     * Sauvegarder une offre (favoris)
     */
    saveOffer: async (offerId) => {
        const response = await api.post('/students/saved-offers/', { offer_id: offerId });
        return response.data;
    },

    /**
     * Retirer une offre des favoris
     */
    unsaveOffer: async (offerId) => {
        const response = await api.delete(`/students/saved-offers/${offerId}/`);
        return response.data;
    },

    /**
     * Obtenir les offres sauvegardées
     */
    getSavedOffers: async () => {
        const response = await api.get('/students/saved-offers/');
        return response.data;
    },

    /**
     * Obtenir les recommandations d'offres
     */
    getRecommendations: async () => {
        const response = await api.get('/students/recommendations/');
        return response.data;
    }
};

export default offerService;
