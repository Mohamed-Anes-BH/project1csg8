import { useState } from 'react';
import { Link } from 'react-router-dom';

function SignIn() {
    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-orange-500 selection:text-white">
            {/* Custom Navbar for SignIn Page */}
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
                        to="/signup"
                        className="px-5 py-2 rounded-full bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                    >
                        S'inscrire
                    </Link>
                </div>
            </nav>

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

                    <form className="space-y-5">
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

                        <button
                            type="submit"
                            className="w-full bg-[#F9B134] text-black font-bold py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg shadow-orange-500/20"
                        >
                            Se connecter
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
