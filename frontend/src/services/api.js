import axios from 'axios';

// Configuration de base de l'API - dynamique pour supporter accès réseau
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Use current hostname to support network access
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api`;
};
const API_BASE_URL = getApiBaseUrl();

// Créer une instance axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Erreur de réponse du serveur
            if (error.response.status === 401) {
                // Don't redirect for login failures (invalid credentials)
                if (!error.config.url.includes('/login')) {
                    // Token expiré ou invalide
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/signin';
                }
            }
        } else if (error.request) {
            // Pas de réponse du serveur
            console.error('Erreur réseau:', error.request);
        } else {
            // Erreur lors de la configuration de la requête
            console.error('Erreur:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
