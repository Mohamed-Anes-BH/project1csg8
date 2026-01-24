import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EnterpriseSidebar from '../component/EnterpriseSidebar';
import offerService from '../services/offerService';

function GestionDesOffres() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        hasNext: false,
        hasPrevious: false
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOffers();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeFilter, pagination.page, searchTerm]);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.page };
            if (activeFilter !== 'tous') {
                params.status = activeFilter.toUpperCase();
            }
            if (searchTerm) {
                params.search = searchTerm;
            }

            const data = await offerService.getMyOffers(params);

            // Map API response to component format
            const mappedOffers = (data.results || data || []).map(offer => ({
                id: offer.id,
                title: offer.title,
                status: getStatusLabel(offer.status),
                statusType: offer.status?.toLowerCase() || 'draft',
                newCandidates: offer.new_applications_count || 0,
                totalCandidates: offer.applications_count || 0,
                lastModified: formatDate(offer.updated_at || offer.created_at),
                views: offer.views || 0
            }));

            setOffers(mappedOffers);
            setPagination(prev => ({
                ...prev,
                total: data.count || mappedOffers.length,
                hasNext: !!data.next,
                hasPrevious: !!data.previous
            }));
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'DRAFT': 'Brouillon',
            'ACTIVE': 'Publiée',
            'OPEN': 'Publiée',
            'CLOSED': 'Clôturée',
            'ARCHIVED': 'Archivée'
        };
        return statusMap[status?.toUpperCase()] || status || 'Inconnu';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStatusStyle = (type) => {
        const status = type?.toLowerCase() || 'draft';
        switch (status) {
            case 'active':
            case 'open':
            case 'published':
                return 'bg-[#1E3A2F] text-[#4CAF50] border border-[#2D5C48]';
            case 'draft':
            case 'pending':
                return 'bg-[#4D4628] text-[#D4B95E] border border-[#665D3A]';
            case 'closed':
            case 'archived':
                return 'bg-[#3A362D] text-gray-400 border border-[#4A463D]';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    const handlePublish = async (offerId) => {
        try {
            await offerService.publishOffer(offerId);
            fetchOffers();
        } catch (error) {
            console.error("Error publishing offer:", error);
            alert("Erreur lors de la publication.");
        }
    };

    const handleArchive = async (offerId) => {
        try {
            await offerService.archiveOffer(offerId);
            fetchOffers();
        } catch (error) {
            console.error("Error archiving offer:", error);
            alert("Erreur lors de l'archivage.");
        }
    };

    const handleDelete = async (offerId) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;
        try {
            await offerService.deleteOffer(offerId);
            fetchOffers();
        } catch (error) {
            console.error("Error deleting offer:", error);
            alert("Erreur lors de la suppression.");
        }
    };



    // Filter offers by search term (handled by backend used in fetchOffers)
    const filteredOffers = offers;

    if (loading && offers.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex font-sans">
                <EnterpriseSidebar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            {/* Enterprise Sidebar Navigation */}
            <EnterpriseSidebar />

            {/* Main Content */}
            <main className="flex-1 p-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Offres</h1>
                    <Link
                        to="/creation-offre"
                        className="px-4 py-2 rounded-lg bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                    >
                        + Nouvelle offre
                    </Link>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher par titre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#26231D] border border-[#3A362D] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex bg-[#26231D] rounded-lg p-1 border border-[#3A362D]">
                        <button
                            onClick={() => setActiveFilter('tous')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeFilter === 'tous' ? 'bg-[#F9B134] text-black' : 'text-gray-400 hover:text-white hover:bg-[#3A362D]'}`}
                        >
                            Toutes
                        </button>
                        <button
                            onClick={() => setActiveFilter('active')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeFilter === 'active' ? 'bg-[#F9B134] text-black' : 'text-gray-400 hover:text-white hover:bg-[#3A362D]'}`}
                        >
                            Publiées
                        </button>
                        <button
                            onClick={() => setActiveFilter('draft')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeFilter === 'draft' ? 'bg-[#F9B134] text-black' : 'text-gray-400 hover:text-white hover:bg-[#3A362D]'}`}
                        >
                            Brouillons
                        </button>
                        <button
                            onClick={() => setActiveFilter('archived')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeFilter === 'archived' ? 'bg-[#F9B134] text-black' : 'text-gray-400 hover:text-white hover:bg-[#3A362D]'}`}
                        >
                            Archivées
                        </button>
                    </div>
                </div>

                {/* Offers Table */}
                <div className="bg-[#26231D] rounded-xl border border-[#3A362D] overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#3A362D] text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Titre</th>
                                    <th className="px-6 py-4 font-medium">Statut</th>
                                    <th className="px-6 py-4 font-medium">Candidatures</th>
                                    <th className="px-6 py-4 font-medium">Dernière modification</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3A362D]">
                                {filteredOffers.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-[#2F2C25] transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link to={`/gestion-offres/${offer.id}`} className="text-sm font-bold text-white block hover:text-[#F9B134] transition-colors">
                                                {offer.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(offer.statusType)}`}>
                                                {offer.statusType === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] mr-2"></span>}
                                                {offer.statusType === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-[#D4B95E] mr-2"></span>}
                                                {offer.statusType === 'archived' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>}
                                                {offer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/liste-candidatures?offer=${offer.id}`}
                                                className="text-sm text-gray-300 hover:text-[#F9B134] transition-colors"
                                            >
                                                {offer.newCandidates > 0 && <span className="text-[#F9B134]">{offer.newCandidates} nouvelles</span>}
                                                {offer.newCandidates > 0 && " / "}
                                                {offer.totalCandidates} au total
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400">{offer.lastModified}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {offer.statusType === 'draft' && (
                                                    <button
                                                        onClick={() => handlePublish(offer.id)}
                                                        title="Publier"
                                                        className="p-1.5 text-green-400 hover:text-green-300 hover:bg-[#3A362D] rounded transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/modification-offre/${offer.id}`)}
                                                    title="Modifier"
                                                    className="p-1.5 text-gray-400 hover:text-[#F9B134] hover:bg-[#3A362D] rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>

                                                {offer.statusType !== 'archived' && (
                                                    <button
                                                        onClick={() => handleArchive(offer.id)}
                                                        title="Archiver"
                                                        className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-[#3A362D] rounded transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(offer.id)}
                                                    title="Supprimer"
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#3A362D] rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredOffers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p>Aucune offre trouvée.</p>
                                <Link to="/creation-offre" className="text-[#F9B134] hover:underline text-sm mt-2 inline-block">
                                    Créer votre première offre
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-20">
                        <p>Montrant {filteredOffers.length} sur {pagination.total} offres</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={!pagination.hasPrevious}
                                className="px-4 py-2 rounded-lg bg-[#26231D] border border-[#3A362D] hover:bg-[#3A362D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={!pagination.hasNext}
                                className="px-4 py-2 rounded-lg bg-[#26231D] border border-[#3A362D] hover:bg-[#3A362D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default GestionDesOffres;
