import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import EnterpriseSidebar from '../component/EnterpriseSidebar';
import CandidateModal from '../component/CandidateModal';
import applicationService from '../services/applicationService';
import profileService from '../services/profileService';

function ListeCandidateurs() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const offerId = searchParams.get('offer');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [offerTitle, setOfferTitle] = useState('');
    const [displayCount, setDisplayCount] = useState(5);

    // Real data from API
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const params = offerId ? { offer_id: offerId } : {};
                const data = await applicationService.getCompanyApplications(params);

                // Map API response to component format
                const mappedCandidates = (data.results || data || []).map(app => ({
                    id: app.id,
                    student_id: app.student_id,
                    name: `${app.first_name || ''} ${app.last_name || ''}`.trim() || app.student_name || 'Candidat',
                    initials: getInitials(app.first_name, app.last_name),
                    education_level: app.education_level || 'Non spécifié',
                    title: app.student_title || app.title || 'Profil étudiant',
                    status: app.status?.toLowerCase() || 'pending',
                    avatar: app.avatar_path || null,
                    offer_title: app.offer_title || '',
                    created_at: app.created_at,
                    has_cv: app.has_cv || !!app.cv_path,
                    internal_note: app.internal_note || '',
                    degree: app.education_level || 'Non spécifié',
                    university: 'Algeria'
                }));

                setCandidates(mappedCandidates);

                // Set offer title if available from first result
                if (mappedCandidates.length > 0 && mappedCandidates[0].offer_title) {
                    setOfferTitle(mappedCandidates[0].offer_title);
                }
            } catch (error) {
                console.error("Error fetching candidates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [offerId]);

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${first}${last}` || 'CA';
    };

    const filters = [
        { key: 'tous', label: 'Toutes les candidatures' },
        { key: 'pending', label: 'En attente' },
        { key: 'preselected', label: 'Présélectionnés' },
        { key: 'accepted', label: 'Acceptés' },
        { key: 'rejected', label: 'Refusés' }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'EN ATTENTE', style: 'bg-[#F9B134] text-black', dotColor: 'bg-[#F9B134]' };
            case 'preselected':
                return { text: 'PRÉSÉLECTIONNÉ', style: 'bg-[#3B82F6] text-white', dotColor: 'bg-[#3B82F6]' };
            case 'accepted':
                return { text: 'ACCEPTÉ', style: 'bg-[#22C55E] text-white', dotColor: 'bg-[#22C55E]' };
            case 'rejected':
                return { text: 'REFUSÉ', style: 'bg-[#EF4444] text-white', dotColor: 'bg-[#EF4444]' };
            default:
                return { text: 'INCONNU', style: 'bg-gray-500 text-white', dotColor: 'bg-gray-500' };
        }
    };

    const getEducationBadgeStyle = (level) => {
        if (!level || level === 'Non spécifié') return 'bg-[#4A4A4A] text-gray-300';
        const lowerLevel = level.toLowerCase();
        if (lowerLevel.includes('master')) return 'bg-[#6366F1] text-white';
        if (lowerLevel.includes('licence')) return 'bg-[#8B5CF6] text-white';
        if (lowerLevel.includes('ingénieur') || lowerLevel.includes('ingenieur')) return 'bg-[#EC4899] text-white';
        if (lowerLevel.includes('doctorat')) return 'bg-[#14B8A6] text-white';
        return 'bg-[#4A4A4A] text-gray-300';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return `Postulé le ${date.toLocaleDateString('fr-FR', options).replace('.', '')}`;
    };

    const handleViewCV = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCandidate(null);
    };

    const updateCandidateStatus = async (id, newStatus, internalNote = null) => {
        try {
            // Optimistic update
            setCandidates(prev =>
                prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
            );

            // API call - map status to backend format
            const statusMap = {
                'accepted': 'ACCEPTED',
                'rejected': 'REJECTED',
                'pending': 'PENDING',
                'preselected': 'PRESELECTED'
            };

            await applicationService.updateApplicationStatus(id, statusMap[newStatus] || newStatus.toUpperCase(), internalNote);
            handleCloseModal();
        } catch (error) {
            console.error("Error updating status:", error);
            // Revert on error - fetch fresh data
            const params = offerId ? { offer_id: offerId } : {};
            const data = await applicationService.getCompanyApplications(params);
            const mappedCandidates = (data.results || data || []).map(app => ({
                id: app.id,
                student_id: app.student_id,
                name: `${app.first_name || ''} ${app.last_name || ''}`.trim() || app.student_name || 'Candidat',
                initials: getInitials(app.first_name, app.last_name),
                education_level: app.education_level || 'Non spécifié',
                title: app.student_title || app.title || 'Profil étudiant',
                status: app.status?.toLowerCase() || 'pending',
                avatar: app.avatar_path || null,
                offer_title: app.offer_title || '',
                created_at: app.created_at,
                has_cv: app.has_cv || !!app.cv_path,
                internal_note: app.internal_note || '',
                degree: app.education_level || 'Non spécifié',
                university: 'Algeria'
            }));
            setCandidates(mappedCandidates);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    const handleAccept = (id) => updateCandidateStatus(id, 'accepted');
    const handleReject = (id) => updateCandidateStatus(id, 'rejected');
    const handlePending = (id) => updateCandidateStatus(id, 'pending');
    const handlePreselect = (id) => updateCandidateStatus(id, 'preselected');

    const handleDownloadCV = async (studentId) => {
        try {
            const blob = await profileService.downloadStudentCV(studentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cv_${studentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading CV:", error);
            alert("Erreur lors du téléchargement du CV.");
        }
    };

    // Filter candidates
    const filteredCandidates = candidates.filter(candidate => {
        return activeFilter === 'tous' || candidate.status === activeFilter;
    });

    // Candidates to display (with pagination)
    const displayedCandidates = filteredCandidates.slice(0, displayCount);
    const hasMoreCandidates = filteredCandidates.length > displayCount;

    const handleShowMore = () => {
        setDisplayCount(prev => prev + 5);
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

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            <EnterpriseSidebar />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Candidatures</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-white">Toutes les candidatures</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {offerId && offerTitle ? `Candidatures : ${offerTitle}` : 'Candidatures reçues'}
                        </h1>
                        <p className="text-gray-400">
                            {offerId && offerTitle
                                ? `Gestion des candidatures pour l'offre "${offerTitle}"`
                                : "Gérez et suivez les demandes des étudiants pour vos offres de stage."
                            }
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {filters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => {
                                    setActiveFilter(filter.key);
                                    setDisplayCount(5);
                                }}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${activeFilter === filter.key
                                    ? 'bg-[#F9B134] text-black border-[#F9B134]'
                                    : 'bg-transparent text-gray-400 border-[#3A362D] hover:text-white hover:border-[#5A5650]'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Candidates List */}
                    <div className="space-y-4">
                        {displayedCandidates.map((candidate) => {
                            const badge = getStatusBadge(candidate.status);
                            return (
                                <div
                                    key={candidate.id}
                                    className="bg-[#1A1814] rounded-xl p-5 border border-[#2A2620] hover:border-[#3A362D] transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Candidate Info */}
                                        <div className="flex items-center gap-4">
                                            {/* Avatar with Initials */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F9B134] to-[#E5A02A] flex items-center justify-center flex-shrink-0 text-black font-bold text-lg">
                                                {candidate.avatar ? (
                                                    <img
                                                        src={candidate.avatar}
                                                        alt={candidate.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    candidate.initials
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                {/* Name and Education Level */}
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="font-semibold text-white text-lg">{candidate.name}</h3>
                                                    {candidate.education_level && candidate.education_level !== 'Non spécifié' && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getEducationBadgeStyle(candidate.education_level)}`}>
                                                            {candidate.education_level}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title and Date */}
                                                <div className="flex items-center gap-4 text-gray-400 text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{candidate.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{formatDate(candidate.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="flex items-center gap-3">
                                            {/* Status Badge */}
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${badge.style}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}></span>
                                                {badge.text}
                                            </span>

                                            {/* View Button */}
                                            <button
                                                onClick={() => navigate(`/candidature/${candidate.id}`)}
                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                title="Voir le profil"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>


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
                                <p className="text-lg mb-2">Aucun candidat trouvé</p>
                                <p className="text-sm">Aucune candidature ne correspond à ce filtre.</p>
                            </div>
                        )}
                    </div>

                    {/* Show More Button */}
                    {hasMoreCandidates && (
                        <div className="flex justify-center mt-8 mb-16">
                            <button
                                onClick={handleShowMore}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent border border-[#3A362D] text-gray-400 font-medium hover:text-white hover:border-[#5A5650] transition-colors"
                            >
                                Afficher plus de candidatures
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
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
