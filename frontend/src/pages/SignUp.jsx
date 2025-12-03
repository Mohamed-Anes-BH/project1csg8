import { useState } from 'react';
import { Link } from 'react-router-dom';

function SignUp() {
    const [userType, setUserType] = useState('student');
    const [activeTab, setActiveTab] = useState('signup');

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-orange-500 selection:text-white">
            {/* Custom Navbar for SignUp Page */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
                        <span className="text-black font-bold text-xs">DZ</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">DZ-Stagiaire</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <Link to="/offres" className="hover:text-white transition-colors">Offres de stage</Link>
                    <Link to="/entreprises" className="hover:text-white transition-colors">Entreprises</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/entreprises"
                        className="hidden md:block px-5 py-2 rounded-full border border-[#F9B134] text-[#F9B134] text-sm font-medium hover:bg-[#F9B134]/10 transition-colors"
                    >
                        Pour Entreprise
                    </Link>
                    <Link
                        to="/signin"
                        className="px-5 py-2 rounded-full bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                    >
                        Connexion
                    </Link>
                </div>
            </nav>

            <div className="flex flex-col items-center justify-center px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
                        {userType === 'student' ? 'Étudiant' : 'Entreprise'}
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg">
                        Rejoignez la plus grande plateforme de stages en Algérie
                    </p>
                </div>

                {/* User Type Toggle */}
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

                {/* Main Card */}
                <div className="w-full max-w-lg bg-[#252525] rounded-3xl p-8 shadow-2xl border border-white/5">
                    {/* Tabs */}
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

                    {/* Form Title */}
                    <h2 className="text-xl font-bold mb-6">
                        {activeTab === 'signup'
                            ? `Créez votre compte ${userType === 'student' ? 'étudiant' : 'entreprise'}`
                            : 'Connectez-vous à votre compte'
                        }
                    </h2>

                    {/* Form */}
                    <form className="space-y-5">
                        {activeTab === 'signup' && (
                            <div>
                                <label className="block text-white mb-2 text-sm font-medium">
                                    {userType === 'student' ? 'Nom complet' : "Nom de l'entreprise"}
                                </label>
                                <input
                                    type="text"
                                    placeholder={userType === 'student' ? 'Entrez votre nom complet' : "Entrez le nom de l'entreprise"}
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-white mb-2 text-sm font-medium">Adresse e-mail</label>
                            <input
                                type="email"
                                placeholder="Entrez votre adresse e-mail"
                                className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-2 text-sm font-medium">Mot de passe</label>
                            <input
                                type="password"
                                placeholder="Entrez votre mot de passe"
                                className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                            />
                        </div>

                        {activeTab === 'signup' && (
                            <div>
                                <label className="block text-white mb-2 text-sm font-medium">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    placeholder="Confirmez votre mot de passe"
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                />
                            </div>
                        )}

                        {activeTab === 'signup' && (
                            <div className="flex items-start gap-3 pt-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#3d3d3d] bg-[#2d2d2d] checked:border-[#F9B134] checked:bg-[#F9B134] transition-all"
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
                            className="w-full bg-[#F9B134] text-black font-bold py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg shadow-orange-500/20"
                        >
                            {activeTab === 'signup' ? 'Créer un compte' : 'Se connecter'}
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
