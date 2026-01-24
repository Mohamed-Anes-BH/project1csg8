import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function SignIn() {
    const navigate = useNavigate();
    const { login, isStudent, isCompany } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);

            // Redirection selon le rôle (utiliser const user pour éviter l'état asynchrone)
            if (user?.role === 'STUDENT') {
                navigate('/profile-etudiant');
            } else if (user?.role === 'COMPANY') {
                navigate('/profil-entreprise');
            } else {
                navigate('/');
            }
        } catch (error) {
            // L'erreur est déjà gérée par le toast dans AuthContext
            console.error('Erreur de connexion:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">
            <div className="flex flex-col items-center justify-center px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
                        Bon retour !
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg">
                        Connectez-vous pour accéder à votre espace
                    </p>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-lg bg-[#252525] rounded-3xl p-8 shadow-2xl border border-white/5">
                    <h2 className="text-xl font-bold mb-6">Connectez-vous à votre compte</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-white mb-2 text-sm font-medium">Adresse e-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Entrez votre adresse e-mail"
                                className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-2 text-sm font-medium">Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Entrez votre mot de passe"
                                className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#F9B134] text-black font-bold py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connexion...
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-400 pt-2">
                            Pas de compte ?{' '}
                            <Link
                                to="/signup"
                                className="text-[#F9B134] font-semibold hover:underline"
                            >
                                S'inscrire
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
