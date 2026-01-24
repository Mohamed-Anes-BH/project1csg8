import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import profileService from '../services/profileService';

function RecommandationsPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await profileService.getRecommendations();
                setOffers(data);
            } catch (error) {
                console.error("Failed to load recommendations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const getStatusLabel = (status) => {
        switch (status) {
            case 'OPEN': return 'Ouverte';
            case 'CLOSED': return 'Fermée';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Note: Navbar is handled by Layout in main.jsx */}

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <Link to="/dashboard-etudiant" className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Recommandations</h1>
                        <p className="text-gray-400 text-sm">
                            Offres correspondant à au moins 3 de vos compétences.
                        </p>
                    </div>
                </div>

                {offers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-[#26231D] flex items-center justify-center mx-auto mb-4 border border-[#3A362D]">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Aucune recommandation trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Nous n'avons trouvé aucune offre correspondant à au moins 3 de vos compétences actuellement. Essayez d'ajouter plus de compétences à votre profil.
                        </p>
                        <Link to="/profile-etudiant" className="mt-4 inline-block px-4 py-2 bg-[#F9B134] text-black rounded-lg font-bold text-sm hover:bg-[#e5a02a] transition-colors">
                            Mettre à jour mes compétences
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <Link to={`/offre/${offer.id}`} key={offer.id} className="bg-[#26231D] rounded-xl border border-[#3A362D] hover:border-[#F9B134]/50 transition-colors group overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden">
                                            {offer.logo_path ? (
                                                <img src={offer.logo_path} alt={offer.company_name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-black font-bold text-xs">{offer.company_name?.substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className="px-2 py-1 rounded text-[10px] font-medium bg-[#3A362D] text-gray-300 border border-[#4A463D]">
                                            {offer.type}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-[#F9B134] transition-colors line-clamp-2">
                                        {offer.title}
                                    </h3>
                                    <p className="text-[#F9B134] text-sm font-medium mb-4">{offer.company_name}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {offer.skills && offer.skills.split(',').slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded bg-[#3A362D] text-gray-400 text-xs border border-[#4A463D]">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                        {offer.skills && offer.skills.split(',').length > 3 && (
                                            <span className="px-2 py-1 rounded bg-[#3A362D] text-gray-400 text-xs border border-[#4A463D]">
                                                +{offer.skills.split(',').length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-[#3A362D] flex items-center justify-between text-xs text-gray-500 bg-[#2A2721]">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {offer.location}
                                    </div>
                                    <div>
                                        {new Date(offer.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default RecommandationsPage;
