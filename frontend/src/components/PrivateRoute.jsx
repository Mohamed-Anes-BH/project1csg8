import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant pour protéger les routes privées
 * Redirige vers /signin si l'utilisateur n'est pas connecté
 * Redirige vers / si l'utilisateur n'a pas le bon rôle
 */
const PrivateRoute = ({ children, role = null }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();

    // Afficher un loader pendant le chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9B134] mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // Rediriger vers la page de connexion si non authentifié
    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // Vérifier le rôle si spécifié
    if (role && !hasRole(role)) {
        return <Navigate to="/" replace />;
    }

    // Afficher le contenu si tout est OK
    return children;
};

export default PrivateRoute;
