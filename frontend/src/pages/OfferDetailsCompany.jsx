import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EnterpriseSidebar from '../component/EnterpriseSidebar';
import offerService from '../services/offerService';
import { toast } from 'react-toastify';

function OfferDetailsCompany() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState(null);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const data = await offerService.getOfferById(id);
                setOffer(data);
            } catch (error) {
                console.error("Error fetching offer:", error);
                toast.error("Impossible de charger les détails de l'offre.");
                navigate('/gestion-offres'); // Redirect on error
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.")) return;

        try {
            await offerService.deleteOffer(id);
            toast.success("Offre supprimée avec succès.");
            navigate('/gestion-offres');
        } catch (error) {
            console.error("Error deleting offer:", error);
            toast.error("Erreur lors de la suppression de l'offre.");
        }
    };

    const handleArchive = async () => {
        try {
            await offerService.archiveOffer(id);
            toast.success("Offre archivée.");
            // Refresh offer data to show new status
            const updatedOffer = await offerService.getOfferById(id);
            setOffer(updatedOffer);
        } catch (error) {
            console.error("Error archiving offer:", error);
            toast.error("Erreur lors de l'archivage.");
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ACTIVE': { label: 'Active', color: 'bg-[#1E3A2F] text-[#4CAF50] border-[#2D5C48]' },
            'OPEN': { label: 'Active', color: 'bg-[#1E3A2F] text-[#4CAF50] border-[#2D5C48]' },
            'DRAFT': { label: 'Brouillon', color: 'bg-[#4D4628] text-[#D4B95E] border-[#665D3A]' },
            'CLOSED': { label: 'Clôturée', color: 'bg-[#3A362D] text-gray-400 border-[#4A463D]' },
            'ARCHIVED': { label: 'Archivée', color: 'bg-[#3A362D] text-gray-400 border-[#4A463D]' }
        };
        const config = statusMap[status?.toUpperCase()] || statusMap['DRAFT'];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status?.toUpperCase() === 'ACTIVE' || status?.toUpperCase() === 'OPEN' ? 'bg-[#4CAF50]' : 'bg-current'}`}></span>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex font-sans">
                <EnterpriseSidebar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
                </main>
            </div>
        );
    }

    if (!offer) return null;

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            <EnterpriseSidebar />

            <main
                className="flex-1 p-8 relative overflow-y-auto h-screen scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <Link to="/gestion-offres" className="hover:text-white transition-colors">Mes offres</Link>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-white">Détail de l'offre</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-3">{offer.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            {getStatusBadge(offer.status)}
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Publié le {new Date(offer.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span>Réf: #OFF-{new Date(offer.created_at).getFullYear()}-{offer.id.toString().padStart(3, '0')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to={`/modification-offre/${offer.id}`} // Assuming creation-offre can handle edits or we make a new route
                            className="flex items-center gap-2 px-4 py-2 bg-[#26231D] border border-[#3A362D] rounded-lg text-white text-sm font-medium hover:bg-[#3A362D] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Modifier l'offre
                        </Link>
                        {offer.status !== 'ARCHIVED' && (
                            <button
                                onClick={handleArchive}
                                className="flex items-center gap-2 px-4 py-2 bg-[#26231D] border border-[#3A362D] rounded-lg text-white text-sm font-medium hover:bg-[#3A362D] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Archiver
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3A1D1D] border border-[#5C2D2D] rounded-lg text-red-400 text-sm font-medium hover:bg-[#4A2626] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Description Card */}
                    <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Description du poste
                        </h3>
                        <div className="prose prose-invert text-gray-300 max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                            {(() => {
                                let desc = offer.description || '';
                                if (desc.includes('|||PROFILE|||')) {
                                    desc = desc.split('|||PROFILE|||')[0].trim();
                                }
                                if (desc.includes('|||RESPONSIBILITIES|||')) {
                                    return desc.split('|||RESPONSIBILITIES|||')[0].trim();
                                }
                                // Also check for experience level line
                                const expMatch = desc.match(/\n\nNiveau d'expérience requis: .+$/);
                                if (expMatch) {
                                    return desc.replace(expMatch[0], '').trim();
                                }
                                return desc;
                            })()}
                        </div>
                    </div>

                    {/* Responsibilities Card - Only show if there are responsibilities */}
                    {offer.description?.includes('|||RESPONSIBILITIES|||') && (
                        <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-8 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Responsabilités
                            </h3>
                            <div className="text-gray-300 text-sm leading-relaxed">
                                <ul className="space-y-2 list-none p-0 m-0">
                                    {(() => {
                                        const parts = offer.description.split('|||RESPONSIBILITIES|||');
                                        let responsibilities = parts[1] || '';

                                        if (responsibilities.includes('|||PROFILE|||')) {
                                            responsibilities = responsibilities.split('|||PROFILE|||')[0].trim();
                                        }

                                        // Remove experience level line if present
                                        const expMatch = responsibilities.match(/\n\nNiveau d'expérience requis: .+$/);
                                        if (expMatch) {
                                            responsibilities = responsibilities.replace(expMatch[0], '');
                                        }
                                        return responsibilities.trim().split('\n').filter(line => line.trim()).map((line, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{line.replace(/^[-•]\s*/, '').trim()}</span>
                                            </li>
                                        ));
                                    })()}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    {(offer.description?.includes('|||PROFILE|||') || offer.description?.includes("Niveau d'expérience requis:")) && (
                        <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-8 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profil recherché
                            </h3>
                            <div className="prose prose-invert text-gray-300 max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                                {(() => {
                                    if (offer.description.includes('|||PROFILE|||')) {
                                        return offer.description.split('|||PROFILE|||')[1].trim();
                                    }
                                    const expMatch = offer.description.match(/\n\nNiveau d'expérience requis: (.+)$/);
                                    if (expMatch) {
                                        return `Niveau d'expérience requis: ${expMatch[1]}`;
                                    }
                                    return '';
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Tech Stack Card */}
                    <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Compétences techniques
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {offer.skills ? offer.skills.split(',').map((skill, index) => (
                                <span key={index} className="px-4 py-2 bg-[#26231D] text-[#D1D5DB] border border-[#3A362D] rounded-full text-sm font-medium hover:border-[#F9B134] transition-colors">
                                    {skill.trim()}
                                </span>
                            )) : <span className="text-gray-500 italic">Aucune compétence spécifiée</span>}
                        </div>
                    </div>
                </div>

                {/* Performance Stats Frame - Added at the end as requested */}
                <div className="mt-8 bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg className="w-6 h-6 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Performance de l'offre
                    </h3>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex gap-8">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-white mb-1">{offer.views || 0}</span>
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Vues</span>
                            </div>
                            <div className="text-center relative">
                                <span className="block text-3xl font-bold text-[#F9B134] mb-1">{offer.applications_count || 0}</span>
                                <span className="text-xs uppercase tracking-wider text-[#F9B134] font-bold">Candidats</span>
                            </div>
                        </div>

                        <Link
                            to={`/liste-candidatures?offer=${offer.id}`}
                            className="w-full md:w-auto px-6 py-3 border border-[#F9B134] text-[#F9B134] font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#F9B134] hover:text-black transition-all shadow-lg shadow-orange-500/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Voir les candidatures
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default OfferDetailsCompany;
