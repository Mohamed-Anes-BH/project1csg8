import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnterpriseSidebar from '../component/EnterpriseSidebar';

function BordEnterprise() {
    const [activeFilter, setActiveFilter] = useState('tous');

    // Mock data
    const stats = {
        activeOffers: { value: 12, change: '+2 cette semaine' },
        applications: { value: 88, change: '+15% ce mois-ci' },
        views: { value: '1,250', change: '+8% ce mois-ci' }
    };

    const candidatures = [
        {
            id: 1,
            name: 'Amina Ziani',
            offer: 'Développeur Full-Stack',
            date: '12/05/2024',
            status: 'En attente',
            statusType: 'pending'
        },
        {
            id: 2,
            name: 'Yacine Belkacem',
            offer: 'Designer UI/UX',
            date: '11/05/2024',
            status: 'Présélectionné',
            statusType: 'preselected'
        },
        {
            id: 3,
            name: 'Karim Haddad',
            offer: 'Chef de Projet Junior',
            date: '10/05/2024',
            status: 'Rejeté',
            statusType: 'rejected'
        },
        {
            id: 4,
            name: 'Lina Bouzid',
            offer: 'Développeur Full-Stack',
            date: '09/05/2024',
            status: 'Accepté',
            statusType: 'accepted'
        }
    ];

    const filters = [
        { key: 'tous', label: 'Tous' },
        { key: 'pending', label: 'En attente' },
        { key: 'preselected', label: 'Présélectionné' },
        { key: 'rejected', label: 'Rejeté' }
    ];

    const getStatusStyle = (type) => {
        switch (type) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
            case 'preselected':
                return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border border-red-500/30';
            case 'accepted':
                return 'bg-green-500/20 text-green-400 border border-green-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    const filteredCandidatures = activeFilter === 'tous'
        ? candidatures
        : candidatures.filter(c => c.statusType === activeFilter);

    return (
        <div className="min-h-screen bg-[#121212] text-white flex">
            {/* Sidebar */}
            <EnterpriseSidebar />

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold italic mb-2">Tableau de Bord</h1>
                        <p className="text-gray-400">Bienvenue, voici un aperçu de vos activités.</p>
                    </div>
                    <Link
                        to="/creation-offre"
                        className="px-6 py-3 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors"
                    >
                        Créer une offre
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Active Offers */}
                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                        <p className="text-gray-400 text-sm mb-2">Nombre d'offres actives</p>
                        <p className="text-4xl font-bold mb-2">{stats.activeOffers.value}</p>
                        <p className="text-green-400 text-sm">{stats.activeOffers.change}</p>
                    </div>

                    {/* Applications Received */}
                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                        <p className="text-gray-400 text-sm mb-2">Candidatures reçues</p>
                        <p className="text-4xl font-bold mb-2">{stats.applications.value}</p>
                        <p className="text-green-400 text-sm">{stats.applications.change}</p>
                    </div>

                    {/* Views */}
                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                        <p className="text-gray-400 text-sm mb-2">Vues des offres</p>
                        <p className="text-4xl font-bold mb-2">{stats.views.value}</p>
                        <p className="text-green-400 text-sm">{stats.views.change}</p>
                    </div>
                </div>

                {/* Recent Applications Section */}
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-bold mb-6">Candidatures Récentes</h2>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeFilter === filter.key
                                        ? 'bg-[#F9B134] text-black'
                                        : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Applications Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b border-zinc-800">
                                    <th className="pb-4 font-medium">Nom du candidat</th>
                                    <th className="pb-4 font-medium">Offre postulée</th>
                                    <th className="pb-4 font-medium">Date</th>
                                    <th className="pb-4 font-medium">Statut</th>
                                    <th className="pb-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidatures.map((candidat) => (
                                    <tr key={candidat.id} className="border-b border-zinc-800/50 last:border-0">
                                        <td className="py-4 font-medium text-white">{candidat.name}</td>
                                        <td className="py-4 text-gray-400">{candidat.offer}</td>
                                        <td className="py-4 text-gray-400">{candidat.date}</td>
                                        <td className="py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(candidat.statusType)}`}>
                                                {candidat.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredCandidatures.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Aucune candidature trouvée pour ce filtre.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BordEnterprise;
