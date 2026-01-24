import api from './api';

/**
 * Service d'authentification
 */
const authService = {
    /**
     * Inscription d'un étudiant
     */
    registerStudent: async (data) => {
        const response = await api.post('/auth/register/student/', data);
        return response.data;
    },

    /**
     * Inscription d'une entreprise
     */
    registerCompany: async (data) => {
        const response = await api.post('/auth/register/company/', data);
        return response.data;
    },

    /**
     * Connexion
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login/', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data.user_id,
                email: email,
                role: response.data.role
            }));
        }
        return response.data;
    },

    /**
     * Déconnexion
     */
    logout: async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Vérification de l'email
     */
    verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email/?token=${token}`);
        return response.data;
    },

    /**
     * Renvoyer l'email de vérification
     */
    resendVerification: async (email) => {
        const response = await api.post('/auth/resend-verification/', { email });
        return response.data;
    },

    /**
     * Demande de réinitialisation de mot de passe
     */
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password/', { email });
        return response.data;
    },

    /**
     * Réinitialisation du mot de passe
     */
    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password/', { token, password });
        return response.data;
    },

    /**
     * Changer le mot de passe
     */
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.post('/auth/change-password/', {
            current_password: currentPassword,
            new_password: newPassword
        });
        return response.data;
    },

    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser: async () => {
        const response = await api.get('/auth/me/');
        return response.data;
    },

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    /**
     * Obtenir l'utilisateur depuis le localStorage
     */
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Obtenir le rôle de l'utilisateur
     */
    getUserRole: () => {
        const user = authService.getUser();
        return user ? user.role : null;
    }
};

export default authService;
