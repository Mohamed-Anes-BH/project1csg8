import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import applicationService from '../services/applicationService';
import offerService from '../services/offerService';

function TableBordEtudient() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        applications_count: 0,
        saved_offers_count: 0,
        accepted_count: 0,
        refused_count: 0,
        profile_views: 0,
        profile_completeness: 0,
        unread_notifications: 0,
        recent_notifications: [],
        recommendations: []
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]);
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [totalHistoryPages, setTotalHistoryPages] = useState(1);
    const [savedOffers, setSavedOffers] = useState([]);
    const [userName, setUserName] = useState("Étudiant");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Immediate UI from LocalStorage (Cache-First Strategy)
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserName(user.first_name || user.username || "Étudiant");
                }

                // Try to load cached stats if available to show immediately
                const cachedStats = localStorage.getItem('dashboard_stats');
                if (cachedStats) {
                    setDashboardData(JSON.parse(cachedStats));
                    setLoading(false); // Immediate display if cache exists
                }

                // 2. Parallel Fetching (Faster Network)
                const [stats, recentApps, appsFull, saved] = await Promise.all([
                    profileService.getStudentDashboard().catch(e => { console.warn("Stats failed", e); return null; }),
                    applicationService.getApplications({ limit: 5 }).catch(e => { console.warn("Apps failed", e); return { results: [] }; }),
                    applicationService.getApplications({ page: historyPage, limit: historyExpanded ? 10 : 5 }).catch(e => { console.warn("Apps full failed", e); return { results: [], count: 0 }; }),
                    offerService.getSavedOffers().catch(e => { console.warn("Saved offers failed", e); return []; })
                ]);

                // 3. Update State only if data returned
                if (stats) {
                    setDashboardData(stats);
                    localStorage.setItem('dashboard_stats', JSON.stringify(stats)); // Update Cache
                }
                if (recentApps && recentApps.results) setRecentApplications(recentApps.results);
                if (appsFull) {
                    setAllApplications(appsFull.results || []);
                    setTotalHistoryPages(Math.ceil((appsFull.count || stats?.applications_count || 0) / (historyExpanded ? 10 : 5)));
                }
                if (saved) setSavedOffers(saved);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [historyExpanded, historyPage]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getStatusStyle = (status) => {
        const type = status?.toLowerCase() || 'pending';
        switch (type) {
            case 'viewed': return 'bg-[#3B4D61] text-[#8DA2FB]';
            case 'pending': return 'bg-[#4D4628] text-[#D4B95E]'; // En attente
            case 'preselected': return 'bg-[#4D4628] text-[#D4B95E]';
            case 'accepted': return 'bg-[#2D4A35] text-[#81C784]';
            case 'rejected': return 'bg-[#4A2D2D] text-[#E57373]';
            case 'archived': return 'bg-[#3A362D] text-gray-400';
            case 'expired': return 'bg-[#3A362D] text-gray-400';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    // Map backend status to frontend display text
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

    const getNotifColor = (type) => {
        // Simple mapping based on assumption of backend data
        return 'bg-[#F9B134]';
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
            {/* Navbar Placeholder - Assuming Navbar component handles this, but adding the Search/Profile look from image if needed. 
                For now, we stick to the page content as requested. */}



            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1">
                        Bienvenue, {userName}!
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Voici un aperçu de votre activité et des opportunités qui vous attendent.
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column (Main) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                                <p className="text-gray-400 text-xs mb-1">Candidatures envoyées</p>
                                <p className="text-3xl font-bold text-white">{dashboardData.applications_count}</p>
                            </div>
                            <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                                <p className="text-gray-400 text-xs mb-1">Offres sauvegardées</p>
                                <p className="text-3xl font-bold text-white">{dashboardData.saved_offers_count}</p>
                            </div>
                            <div className="bg-[#2D4A35] rounded-xl p-5 border border-[#436E4F]">
                                <p className="text-gray-300 text-xs mb-1">Candidatures Acceptées</p>
                                <p className="text-3xl font-bold text-white">{dashboardData.accepted_count || 0}</p>
                            </div>
                            <div className="bg-[#4A2D2D] rounded-xl p-5 border border-[#6E4343]">
                                <p className="text-gray-300 text-xs mb-1">Candidatures Refusées</p>
                                <p className="text-3xl font-bold text-white">{dashboardData.refused_count || 0}</p>
                            </div>
                        </div>

                        {/* Recent Applications */}
                        <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                            <h2 className="text-lg font-bold mb-4">Candidatures Récentes</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 text-xs border-b border-[#3A362D]">
                                        <tr>
                                            <th className="pb-3 font-medium">Poste</th>
                                            <th className="pb-3 font-medium">Entreprise</th>
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3A362D]">
                                        {recentApplications.map((app) => (
                                            <tr key={app.id}>
                                                <td className="py-3 font-medium text-white">{app.offer_title || app.poste}</td>
                                                <td className="py-3 text-gray-400">{app.company_name || app.entreprise}</td>
                                                <td className="py-3 text-gray-400">{formatDate(app.created_at || app.date)}</td>
                                                <td className="py-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(app.status || app.statutType)}`}>
                                                        {getStatusLabel(app.status || app.statut)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* History Applications */}
                        <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Historique des candidatures</h2>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-[#3A362D] text-gray-400 text-xs hover:text-white hover:bg-[#3A362D] transition-colors flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Archives
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg border border-[#3A362D] text-gray-400 text-xs hover:text-white hover:bg-[#3A362D] transition-colors flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Filtrer
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 text-xs border-b border-[#3A362D]">
                                        <tr>
                                            <th className="pb-3 font-medium">Poste</th>
                                            <th className="pb-3 font-medium">Entreprise</th>
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Statut</th>
                                            <th className="pb-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3A362D]">
                                        {recentApplications.map((app) => (
                                            <tr key={app.id}>
                                                <td className="py-3 font-medium text-white">{app.offer_title || app.poste}</td>
                                                <td className="py-3 text-gray-400">
                                                    {app.company_name || app.entreprise}
                                                    <div className="text-xs text-gray-500">{formatDate(app.created_at || app.date)}</div>
                                                </td>
                                                <td className="py-3 text-gray-400">{formatDate(app.created_at || app.date)}</td>
                                                <td className="py-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(app.status || app.statutType)}`}>
                                                        {getStatusLabel(app.status || app.statut)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button className="text-gray-400 hover:text-white">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination and View All Button */}
                            <div className="mt-4 flex flex-col items-center gap-4">
                                {historyExpanded && totalHistoryPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                                            disabled={historyPage === 1}
                                            className="p-1 px-3 rounded bg-[#3A362D] text-white disabled:opacity-50 text-xs"
                                        >
                                            Précédent
                                        </button>
                                        <span className="text-xs text-gray-400">
                                            Page {historyPage} sur {totalHistoryPages}
                                        </span>
                                        <button
                                            onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                                            disabled={historyPage === totalHistoryPages}
                                            className="p-1 px-3 rounded bg-[#3A362D] text-white disabled:opacity-50 text-xs"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setHistoryExpanded(!historyExpanded);
                                        setHistoryPage(1);
                                    }}
                                    className="text-[#F9B134] text-xs font-medium hover:underline"
                                >
                                    {historyExpanded ? "Réduire l'historique" : "Voir tout l'historique"}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">

                        {/* Profile Completion */}
                        {dashboardData.profile_completeness < 100 && (
                            <div className="bg-[#26231D] rounded-xl p-4 border border-[#3A362D]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium text-xs">Complétude du profil</span>
                                    <span className="text-[#F9B134] font-bold text-xs">{dashboardData.profile_completeness}%</span>
                                </div>
                                <div className="w-full bg-[#3A362D] rounded-full h-1.5 mb-3">
                                    <div
                                        className="bg-[#F9B134] h-1.5 rounded-full"
                                        style={{ width: `${dashboardData.profile_completeness}%` }}
                                    ></div>
                                </div>
                                <Link
                                    to="/profile-etudiant"
                                    className="block w-full text-center py-2 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors text-xs"
                                >
                                    Compléter mon profil
                                </Link>
                            </div>
                        )}

                        {/* Saved Offers */}
                        <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                            <h2 className="text-lg font-bold mb-4">Offres Sauvegardées</h2>
                            <div className="space-y-3">
                                {savedOffers.length > 0 ? (
                                    savedOffers.map((offer) => (
                                        <Link
                                            to={`/offre/${offer.id}`}
                                            key={offer.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3A362D] transition-colors group border border-transparent hover:border-[#4A463D]"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#3A362D] flex items-center justify-center overflow-hidden border border-[#4A463D] group-hover:border-[#F9B134]/50 transition-colors">
                                                {offer.company_logo ? (
                                                    <img src={offer.company_logo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[#F9B134] font-bold text-xs">
                                                        {offer.company_name?.substring(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white text-sm group-hover:text-[#F9B134] transition-colors truncate">{offer.title}</h3>
                                                <p className="text-gray-400 text-xs truncate">{offer.company_name}</p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-500 group-hover:text-[#F9B134] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <p className="text-gray-500 text-xs">Aucune offre sauvegardée</p>
                                        <Link to="/offres" className="text-[#F9B134] text-xs hover:underline mt-1 inline-block">
                                            Parcourir les offres
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Recommendations Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Recommandations pour vous</h2>
                        <Link to="/recommandations" className="text-[#F9B134] text-xs hover:underline">
                            Voir plus
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dashboardData.recommendations.map((rec) => (
                            <Link to={`/offre/${rec.id}`} key={rec.id} className="block bg-[#26231D] rounded-xl p-5 border border-[#3A362D] hover:border-[#F9B134]/30 transition-colors">
                                <h3 className="font-bold text-white text-sm mb-1">{rec.title}</h3>
                                <p className="text-[#F9B134] text-xs font-medium mb-1">{rec.company_name}</p>
                                <p className="text-gray-500 text-xs">{rec.location}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TableBordEtudient;
