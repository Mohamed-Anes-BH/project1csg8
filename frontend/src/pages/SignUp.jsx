import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function SignUp() {
    const navigate = useNavigate();
    const { registerStudent, registerCompany } = useAuth();
    const [userType, setUserType] = useState('student');
    const [activeTab, setActiveTab] = useState('signup');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (activeTab === 'signin') {
            navigate('/signin');
            return;
        }

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (!formData.acceptTerms) {
            toast.error('Veuillez accepter les conditions d\'utilisation');
            return;
        }

        setLoading(true);
        try {
            const data = {
                email: formData.email,
                password: formData.password
            };

            if (userType === 'student') {
                await registerStudent(data);
            } else {
                data.company_name = formData.name;
                await registerCompany(data);
            }

            // Store email for verification page
            localStorage.setItem('pendingVerificationEmail', formData.email);
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white">
            <div className="flex flex-col items-center justify-center px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
                        {userType === 'student' ? 'Étudiant' : 'Entreprise'}
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg">
                        Rejoignez la plus grande plateforme de stages en Algérie
                    </p>
                </div>

                <div className="bg-[#252525] p-1 rounded-full flex mb-8">
                    <button
                        onClick={() => setUserType('student')}
                        className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${userType === 'student'
                            ? 'bg-[#2d2d2d] text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Pour Étudiant
                    </button>
                    <button
                        onClick={() => setUserType('enterprise')}
                        className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${userType === 'enterprise'
                            ? 'bg-[#2d2d2d] text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Pour Entreprise
                    </button>
                </div>

                <div className="w-full max-w-lg bg-[#252525] rounded-3xl p-8 shadow-2xl border border-white/5">
                    <div className="flex gap-6 mb-8 border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('signup')}
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'signup'
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            S'inscrire
                            {activeTab === 'signup' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F9B134]"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('signin')}
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'signin'
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Se connecter
                            {activeTab === 'signin' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F9B134]"></span>
                            )}
                        </button>
                    </div>

                    <h2 className="text-xl font-bold mb-6">
                        {activeTab === 'signup'
                            ? `Créez votre compte ${userType === 'student' ? 'étudiant' : 'entreprise'}`
                            : 'Connectez-vous à votre compte'
                        }
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {activeTab === 'signup' && (
                            <div>
                                <label className="block text-white mb-2 text-sm font-medium">
                                    {userType === 'student' ? 'Nom complet' : "Nom de l'entreprise"}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={userType === 'student' ? 'Entrez votre nom complet' : "Entrez le nom de l'entreprise"}
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                    disabled={loading}
                                />
                            </div>
                        )}

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

                        {activeTab === 'signup' && (
                            <div>
                                <label className="block text-white mb-2 text-sm font-medium">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirmez votre mot de passe"
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {activeTab === 'signup' && (
                            <div className="flex items-start gap-3 pt-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleChange}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#3d3d3d] bg-[#2d2d2d] checked:border-[#F9B134] checked:bg-[#F9B134] transition-all"
                                        disabled={loading}
                                    />
                                    <svg
                                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        width="12"
                                        height="12"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <label htmlFor="terms" className="text-sm text-gray-400 leading-tight select-none">
                                    J&apos;accepte les{' '}
                                    <span className="text-[#F9B134] underline cursor-pointer hover:text-[#e5a02a]">Conditions d&apos;utilisation</span> et la{' '}
                                    <span className="text-[#F9B134] underline cursor-pointer hover:text-[#e5a02a]">Politique de confidentialité</span>.
                                </label>
                            </div>
                        )}

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
                                    {activeTab === 'signup' ? 'Création...' : 'Connexion...'}
                                </>
                            ) : (
                                activeTab === 'signup' ? 'Créer un compte' : 'Se connecter'
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-400 pt-2">
                            {activeTab === 'signup' ? 'Déjà un compte ?' : 'Pas de compte ?'}{' '}
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab === 'signup' ? 'signin' : 'signup')}
                                className="text-[#F9B134] font-semibold hover:underline"
                            >
                                {activeTab === 'signup' ? 'Se connecter' : "S'inscrire"}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
