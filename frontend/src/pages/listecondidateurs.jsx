import { useState } from 'react';
import CandidateModal from '../component/CandidateModal';

function ListeCandidateurs() {
    const [activeFilter, setActiveFilter] = useState('tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data
    const [candidates, setCandidates] = useState([
        {
            id: 1,
            name: 'Amine Benali',
            degree: 'Master en Informatique',
            university: 'Université des Sciences et de la Technologie Houari Boumediene',
            status: 'pending',
            avatar: null
        },
        {
            id: 2,
            name: 'Sara Mansouri',
            degree: 'Licence en Génie Logiciel',
            university: 'Université d\'Alger 1',
            status: 'preselected',
            avatar: null
        },
        {
            id: 3,
            name: 'Yacine Boudiaf',
            degree: 'Master en Data Science',
            university: 'École Nationale Supérieure d\'Informatique',
            status: 'accepted',
            avatar: null
        },
        {
            id: 4,
            name: 'Meriem Zerhouni',
            degree: 'Ingénieur en Informatique',
            university: 'Université Constantine 2',
            status: 'rejected',
            avatar: null
        },
        {
            id: 5,
            name: 'Karim Bensalem',
            degree: 'Master en Intelligence Artificielle',
            university: 'Université des Sciences et de la Technologie d\'Oran',
            status: 'pending',
            avatar: null
        },
        {
            id: 6,
            name: 'Nadia Hamdaoui',
            degree: 'Licence en Développement Web',
            university: 'Université de Béjaïa',
            status: 'preselected',
            avatar: null
        }
    ]);

    const filters = [
        { key: 'tous', label: 'Tous' },
        { key: 'pending', label: 'En attente' },
        { key: 'preselected', label: 'Préselectionné' },
        { key: 'accepted', label: 'Accepté' },
        { key: 'rejected', label: 'Refusé' }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'En attente', style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
            case 'preselected':
                return { text: 'Préselectionné', style: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
            case 'accepted':
                return { text: 'Accepté', style: 'bg-green-500/20 text-green-400 border-green-500/30' };
            case 'rejected':
                return { text: 'Refusé', style: 'bg-red-500/20 text-red-400 border-red-500/30' };
            default:
                return { text: 'Inconnu', style: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
        }
    };

    const handleViewCV = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCandidate(null);
    };

    const updateCandidateStatus = (id, newStatus) => {
        setCandidates(prev =>
            prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
        );
        handleCloseModal();
    };

    const handleAccept = (id) => updateCandidateStatus(id, 'accepted');
    const handleReject = (id) => updateCandidateStatus(id, 'rejected');
    const handlePending = (id) => updateCandidateStatus(id, 'pending');

    // Filter candidates
    const filteredCandidates = candidates.filter(candidate => {
        const matchesFilter = activeFilter === 'tous' || candidate.status === activeFilter;
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.degree.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold italic mb-2">Liste des candidatures</h1>
                    <p className="text-gray-400">
                        Gérez les candidatures pour l'offre de stage: <span className="text-[#F9B134]">Développeur Web Full-Stack</span>
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par nom..."
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
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
                </div>

                {/* Candidates List */}
                <div className="space-y-4">
                    {filteredCandidates.map((candidate) => {
                        const badge = getStatusBadge(candidate.status);
                        return (
                            <div
                                key={candidate.id}
                                className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Candidate Info */}
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center flex-shrink-0">
                                            {candidate.avatar ? (
                                                <img
                                                    src={candidate.avatar}
                                                    alt={candidate.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div>
                                            <h3 className="font-semibold text-white">{candidate.name}</h3>
                                            <p className="text-gray-400 text-sm">{candidate.degree}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleViewCV(candidate)}
                                            className="px-5 py-2.5 rounded-full bg-[#F9B134] text-black font-medium hover:bg-[#e5a02a] transition-colors"
                                        >
                                            Voir CV
                                        </button>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.style}`}>
                                            {badge.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p>Aucun candidat trouvé pour ce filtre.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Candidate Modal */}
            <CandidateModal
                candidate={selectedCandidate}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAccept={handleAccept}
                onReject={handleReject}
                onPending={handlePending}
            />
        </div>
    );
}

export default ListeCandidateurs;
