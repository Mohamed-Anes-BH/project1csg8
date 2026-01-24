import api from './api';

// ==========================================
// DASHBOARD
// ==========================================

export const getDashboardStats = async () => {
    const response = await api.get('/admin/dashboard/stats/');
    return response.data;
};

export const getGrowthStats = async (months = 6) => {
    const response = await api.get(`/admin/dashboard/growth/?months=${months}`);
    return response.data;
};

export const getRecentActivity = async (limit = 10) => {
    const response = await api.get(`/admin/dashboard/activity/?limit=${limit}`);
    return response.data;
};

export const getRecentApplications = async (limit = 10) => {
    const response = await api.get(`/admin/dashboard/applications/?limit=${limit}`);
    return response.data;
};

// ==========================================
// GESTION UTILISATEURS
// ==========================================

export const getUsers = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.verified) queryParams.append('verified', params.verified);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/admin/users/?${queryParams.toString()}`);
    return response.data;
};

export const getUserDetail = async (userId) => {
    const response = await api.get(`/admin/users/${userId}/`);
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post('/admin/users/create/', userData);
    return response.data;
};

export const toggleUser = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/toggle/`);
    return response.data;
};

export const suspendUser = async (userId, reason) => {
    const response = await api.patch(`/admin/users/${userId}/suspend/`, { reason });
    return response.data;
};

export const restoreUser = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/restore/`);
    return response.data;
};

// ==========================================
// MODÉRATION OFFRES
// ==========================================

export const getOffers = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.approved) queryParams.append('approved', params.approved);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/admin/offers/?${queryParams.toString()}`);
    return response.data;
};

export const getOfferStats = async () => {
    const response = await api.get('/admin/offers/stats/');
    return response.data;
};

export const getOfferDetail = async (offerId) => {
    const response = await api.get(`/admin/offers/${offerId}/`);
    return response.data;
};

export const approveOffer = async (offerId) => {
    const response = await api.patch(`/admin/offers/${offerId}/approve/`);
    return response.data;
};

export const rejectOffer = async (offerId, reason) => {
    const response = await api.patch(`/admin/offers/${offerId}/reject/`, { reason });
    return response.data;
};

export const deleteOffer = async (offerId, reason) => {
    const response = await api.delete(`/admin/offers/${offerId}/delete/`, { data: { reason } });
    return response.data;
};

export const bulkApproveOffers = async (offerIds) => {
    const response = await api.post('/admin/offers/bulk-approve/', { offer_ids: offerIds });
    return response.data;
};

// ==========================================
// PARAMÈTRES SYSTÈME
// ==========================================

export const getSettings = async (category = null) => {
    const url = category ? `/admin/settings/?category=${category}` : '/admin/settings/';
    const response = await api.get(url);
    return response.data;
};

export const updateSettings = async (settings) => {
    const response = await api.patch('/admin/settings/', { settings });
    return response.data;
};

// ==========================================
// AUTRES
// ==========================================

export const getLogs = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await api.get(`/admin/logs/?${queryParams.toString()}`);
    return response.data;
};

export const sendNotification = async (notificationData) => {
    const response = await api.post('/admin/send-notification/', notificationData);
    return response.data;
};

export const getIncompleteProfiles = async () => {
    const response = await api.get('/admin/incomplete-profiles/');
    return response.data;
};

export default {
    // Dashboard
    getDashboardStats,
    getGrowthStats,
    getRecentActivity,
    getRecentApplications,

    // Users
    getUsers,
    getUserDetail,
    createUser,
    toggleUser,
    suspendUser,
    restoreUser,

    // Offers
    getOffers,
    getOfferStats,
    getOfferDetail,
    approveOffer,
    rejectOffer,
    deleteOffer,
    bulkApproveOffers,

    // Settings
    getSettings,
    updateSettings,

    // Others
    getLogs,
    sendNotification,
    getIncompleteProfiles,
};
