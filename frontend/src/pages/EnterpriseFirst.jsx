import { useState } from 'react';
import { Link } from 'react-router-dom';

function EnterpriseFirst() {
    const companies = [
        {
            name: 'Google',
            industry: 'Technologie',
            description: "Organiser l'information à l'échelle mondiale pour la rendre accessible et utile à tous.",
            location: 'Alger, Algérie',
            icon: 'G'
        },
        {
            name: 'Microsoft',
            industry: 'Logiciels',
            description: 'Donner à chaque personne et à chaque organisation les moyens de réaliser ses ambitions.',
            location: 'Oran, Algérie',
            icon: 'M'
        },
        {
            name: 'Apple',
            industry: 'Électronique',
            description: 'Créer les produits les plus innovants qui enrichissent la vie des gens.',
            location: 'Alger, Algérie',
            icon: 'A'
        },
        {
            name: 'Meta',
            industry: 'Réseaux Sociaux',
            description: 'Donner aux gens le pouvoir de construire une communauté et de rapprocher le monde.',
            location: 'Constantine, Algérie',
            icon: 'M'
        },
        {
            name: 'Amazon',
            industry: 'E-commerce',
            description: "Être l'entreprise la plus centrée sur le client au monde, où les clients peuvent trouver tout ce qu'ils veulent.",
            location: 'Alger, Algérie',
            icon: 'A'
        },
        {
            name: 'Netflix',
            industry: 'Streaming',
            description: 'Divertir le monde avec des histoires qui comptent, des séries et des films de tous genres.',
            location: 'Oran, Algérie',
            icon: 'N'
        }
    ];

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                            Recrutez les <br />
                            meilleurs talents de <br />
                            demain
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl">
                            Accédez à un vivier d'étudiants qualifiés, simplifiez votre processus de recrutement et trouvez les stagiaires parfaits pour votre entreprise.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link
                                to="/signup"
                                className="px-8 py-3 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors shadow-lg shadow-orange-500/20"
                            >
                                Créer un compte entreprise
                            </Link>
                            <button className="px-8 py-3 rounded-full bg-[#2d2d2d] text-white font-medium hover:bg-[#3d3d3d] transition-colors border border-white/10">
                                Découvrir les profils
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#252525] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                            {/* Placeholder for Hero Image - simulating the office meeting room */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-[#F9B134]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#F9B134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">Image de bureau moderne</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold mb-8">Découvrez nos entreprises partenaires</h2>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher par nom d'entreprise..."
                            className="w-full bg-[#252525] border border-[#3d3d3d] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#F9B134] transition-colors"
                        />
                    </div>
                    <select className="bg-[#252525] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#F9B134] cursor-pointer">
                        <option>Secteur d'activité</option>
                        <option>Technologie</option>
                        <option>Finance</option>
                    </select>
                    <select className="bg-[#252525] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#F9B134] cursor-pointer">
                        <option>Localisation</option>
                        <option>Alger</option>
                        <option>Oran</option>
                    </select>
                    <select className="bg-[#252525] border border-[#3d3d3d] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#F9B134] cursor-pointer">
                        <option>Taille</option>
                        <option>PME</option>
                        <option>Grande Entreprise</option>
                    </select>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {companies.map((company, index) => (
                        <div key={index} className="bg-[#252525] p-6 rounded-2xl border border-white/5 hover:border-[#F9B134]/50 transition-colors group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl">
                                    {company.icon}
                                </div>
                                <div className="bg-[#F9B134]/10 text-[#F9B134] text-xs font-medium px-3 py-1 rounded-full">
                                    {company.industry}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-[#F9B134] transition-colors">{company.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                {company.description}
                            </p>
                            <div className="flex items-center text-gray-500 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {company.location}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2 mb-20">
                    <button className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3d3d3d] transition-colors">
                        &lt;
                    </button>
                    <button className="w-10 h-10 rounded-full bg-[#F9B134] flex items-center justify-center text-black font-bold">
                        1
                    </button>
                    <button className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3d3d3d] transition-colors">
                        2
                    </button>
                    <button className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3d3d3d] transition-colors">
                        3
                    </button>
                    <span className="flex items-end px-2 text-gray-500">...</span>
                    <button className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3d3d3d] transition-colors">
                        10
                    </button>
                    <button className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3d3d3d] transition-colors">
                        &gt;
                    </button>
                </div>

                {/* Testimonials */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-2">Ce qu'ils disent de nous</h2>
                    <p className="text-gray-400">Des entreprises qui nous ont fait confiance et ont trouvé leurs perles rares.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#252525] p-8 rounded-3xl border border-white/5 relative">
                        <div className="flex gap-1 text-[#F9B134] mb-4">
                            {'★★★★★'}
                        </div>
                        <p className="text-gray-300 italic mb-6">
                            "La plateforme DZ-Stagiaire a transformé notre processus de recrutement de stagiaires. Nous avons trouvé un candidat exceptionnel en moins d'une semaine. L'interface est intuitive et le support est très réactif."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center text-white font-bold">KB</div>
                            <div>
                                <h4 className="font-bold">Karim Bennani</h4>
                                <p className="text-xs text-gray-500">Responsable RH, Yassir</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#252525] p-8 rounded-3xl border border-white/5 relative">
                        <div className="flex gap-1 text-[#F9B134] mb-4">
                            {'★★★★★'}
                        </div>
                        <p className="text-gray-300 italic mb-6">
                            "Une solution efficace pour se connecter avec les jeunes talents algériens. La qualité des profils est impressionnante. C'est devenu notre outil principal pour les stages de fin d'études."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold">AC</div>
                            <div>
                                <h4 className="font-bold">Amina Cherif</h4>
                                <p className="text-xs text-gray-500">Directrice des Talents, Ooredoo Algérie</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EnterpriseFirst;
