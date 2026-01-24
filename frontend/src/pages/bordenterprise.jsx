import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EnterpriseSidebar from '../component/EnterpriseSidebar';
import profileService from '../services/profileService';
import applicationService from '../services/applicationService';
import offerService from '../services/offerService';

function BordEnterprise() {
    const [activeFilter, setActiveFilter] = useState('tous');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeOffers: { value: 0, change: 'Offres actives' },
        applications: { value: 0, change: 'Total reçues' },
        views: { value: 0, change: 'Vues totales' }
    });
    const [candidatures, setCandidatures] = useState([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Dashboard Stats
                const dashboardData = await profileService.getCompanyDashboard();

                // Map backend response to UI stats
                // Backend returns: active_offers_count, total_applications_count, total_views_count
                setStats({
                    activeOffers: { value: dashboardData.active_offers || 0, change: 'Offres actives' },
                    applications: { value: dashboardData.applications_received || 0, change: 'Total reçues' },
                    views: { value: dashboardData.total_views || 0, change: 'Vues totales' }
                });

                // Fetch Recent Applications (Company Side) - Last 5 days
                const appsData = await applicationService.getCompanyApplications({ days: 5 });
                setCandidatures(Array.isArray(appsData) ? appsData : (appsData.results || []));

            } catch (error) {
                console.error("Error fetching company dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleImportExcel = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        try {
            const result = await offerService.importOffersFromExcel(file);
            alert(result.message || "Import réussi !");
            // Refresh stats could be done here
            window.location.reload();
        } catch (error) {
            console.error("Import error:", error);
            alert("Erreur lors de l'import : " + (error.response?.data?.error || error.message));
        } finally {
            setImporting(false);
            event.target.value = null; // Reset input
        }
    };

    const filters = [
        { key: 'tous', label: 'Tous' },
        { key: 'PENDING', label: 'En attente' },
        { key: 'PRESELECTED', label: 'Présélectionné' },
        { key: 'ACCEPTED', label: 'Accepté' },
        { key: 'REJECTED', label: 'Rejeté' }
    ];

    const getStatusStyle = (type) => {
        const status = type?.toLowerCase() || 'pending';
        switch (status) {
            case 'pending': return 'bg-[#3B4D61] text-[#8DA2FB]';
            case 'preselected': return 'bg-[#4D4628] text-[#D4B95E]';
            case 'rejected': return 'bg-[#4A2D2D] text-[#E57373]';
            case 'accepted': return 'bg-[#2D4A35] text-[#81C784]';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    const getStatusLabel = (status) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PENDING': return 'En attente';
            case 'PRESELECTED': return 'Présélectionné';
            case 'ACCEPTED': return 'Acceptée';
            case 'REJECTED': return 'Refusée';
            case 'ARCHIVED': return 'Archivée';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const filteredCandidatures = activeFilter === 'tous'
        ? candidatures
        : candidatures.filter(c => c.status === activeFilter);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1E1C16] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1E1C16] text-white flex font-sans">
            {/* Sidebar */}
            <EnterpriseSidebar />

            {/* Main Content */}
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Tableau de Bord</h1>
                        <p className="text-gray-400 text-sm">Bienvenue, voici un aperçu de vos activités.</p>
                    </div>
                    <div className="flex gap-3">
                        <label className={`px-4 py-2 rounded-lg border border-[#3A362D] text-white text-sm font-medium hover:bg-[#26231D] transition-colors flex items-center gap-2 cursor-pointer ${importing ? 'opacity-50' : ''}`}>
                            {importing ? (
                                <svg className="animate-spin w-4 h-4 text-[#F9B134]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            )}
                            {importing ? "Import..." : "Importer via Excel"}
                            <input type="file" accept=".xlsx" className="hidden" onChange={handleImportExcel} disabled={importing} />
                        </label>
                        <Link
                            to="/creation-offre"
                            className="px-4 py-2 rounded-lg bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                        >
                            Créer une offre
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Active Offers */}
                    <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D] relative overflow-hidden group hover:border-[#F9B134]/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-gray-400 text-sm font-medium">Offres actives</p>
                            <div className="p-2 bg-[#3A362D] rounded-lg text-[#F9B134]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats.activeOffers.value}</p>
                        <p className="text-[#4CAF50] text-xs font-medium">{stats.activeOffers.change}</p>
                    </div>

                    {/* Applications Received */}
                    <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D] relative overflow-hidden group hover:border-[#F9B134]/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-gray-400 text-sm font-medium">Candidatures</p>
                            <div className="p-2 bg-[#3A362D] rounded-lg text-[#F9B134]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats.applications.value}</p>
                        <p className="text-[#4CAF50] text-xs font-medium">{stats.applications.change}</p>
                    </div>

                    {/* Views */}
                    <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D] relative overflow-hidden group hover:border-[#F9B134]/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-gray-400 text-sm font-medium">Vues</p>
                            <div className="p-2 bg-[#3A362D] rounded-lg text-[#F9B134]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats.views.value}</p>
                        <p className="text-[#4CAF50] text-xs font-medium">{stats.views.change}</p>
                    </div>
                </div>

                {/* Recent Applications Section */}
                <div className="bg-[#26231D] rounded-xl border border-[#3A362D] overflow-hidden">
                    <div className="p-5 border-b border-[#3A362D]">
                        <h2 className="text-lg font-bold mb-4">Candidatures Récentes</h2>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${activeFilter === filter.key
                                        ? 'bg-[#3A362D] text-[#F9B134] border border-[#F9B134]/30'
                                        : 'bg-[#1E1C16] text-gray-400 hover:text-white border border-[#3A362D]'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider bg-[#22201A]">
                                    <th className="px-6 py-3 font-medium">Nom du candidat</th>
                                    <th className="px-6 py-3 font-medium">Offre postulée</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Statut</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3A362D]">
                                {filteredCandidatures.map((candidat) => (
                                    <tr key={candidat.id} className="hover:bg-[#2F2C25] transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {candidat.first_name} {candidat.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{candidat.offer_title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(candidat.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(candidat.status)}`}>
                                                {getStatusLabel(candidat.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/admin/candidates/${candidat.id}`} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-[#3A362D] rounded">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredCandidatures.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Aucune candidature pour le moment.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BordEnterprise;
