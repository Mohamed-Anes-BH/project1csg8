import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

// Créer le contexte
export const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Provider du contexte
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Charger l'utilisateur depuis le localStorage au démarrage et rafraîchir
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token) {
                    // OPTIMISTIC LOAD: If we have user data, show UI immediately
                    if (userStr) {
                        setUser(JSON.parse(userStr));
                        setIsAuthenticated(true);
                        setLoading(false); // Stop loading immediately
                    }

                    // Fetch fresh data from backend (background consistency check)
                    try {
                        const freshUser = await authService.getCurrentUser();
                        setUser(freshUser);
                        setIsAuthenticated(true);
                        localStorage.setItem('user', JSON.stringify(freshUser));
                    } catch (fetchError) {
                        console.error("Failed to refresh user data", fetchError);
                        // If token is invalid (401), logout
                        if (fetchError.response && fetchError.response.status === 401) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setUser(null);
                            setIsAuthenticated(false);
                            setLoading(false); // Ensure loading stops even if it was optimized
                        }
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l\'utilisateur:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Fonction de connexion
    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            // After login, fetch full profile details
            const userData = await authService.getCurrentUser();

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData)); // Store full profile

            toast.success('Connexion réussie!');
            return userData;
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de la connexion';
            toast.error(message, { autoClose: 6000 });
            throw error;
        }
    };

    // Fonction d'inscription étudiant
    const registerStudent = async (data) => {
        try {
            const response = await authService.registerStudent(data);
            toast.success('Inscription réussie! Veuillez vérifier votre email.');
            return response;
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de l\'inscription';
            toast.error(message, { autoClose: 6000 });
            throw error;
        }
    };

    // Fonction d'inscription entreprise
    const registerCompany = async (data) => {
        try {
            const response = await authService.registerCompany(data);
            toast.success('Inscription réussie! Veuillez vérifier votre email.');
            return response;
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de l\'inscription';
            toast.error(message, { autoClose: 6000 });
            throw error;
        }
    };

    // Fonction de déconnexion
    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            toast.info('Déconnexion réussie');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            // Déconnecter quand même côté client
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Vérifier si l'utilisateur a un rôle spécifique
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Vérifier si l'utilisateur est étudiant
    const isStudent = () => hasRole('STUDENT');

    // Vérifier si l'utilisateur est entreprise
    const isCompany = () => hasRole('COMPANY');

    // Vérifier si l'utilisateur est admin
    const isAdmin = () => hasRole('ADMIN');

    // Mettre à jour l'utilisateur manuellement (ex: après modif profil)
    const updateUser = (userData) => {
        // Merge with existing user data to ensure we don't lose fields like role if userData is partial
        // But typically userData should be complete. For safety, let's assume it might be partial or full.
        // Actually, usually we fetch the full fresh user.
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        registerStudent,
        registerCompany,
        updateUser,
        hasRole,
        isStudent,
        isCompany,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
