import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EnterpriseSidebar from '../component/EnterpriseSidebar';
import applicationService from '../services/applicationService';
import profileService from '../services/profileService';

function CandidateDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);

    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchCandidateDetails = async () => {
            try {
                setLoading(true);
                const data = await applicationService.getApplicationById(id);

                // Parse formations and experiences if they are strings
                let formations = [];
                let experiences = [];
                let skills = [];

                if (data.formations) {
                    try {
                        formations = typeof data.formations === 'string'
                            ? JSON.parse(data.formations)
                            : data.formations;
                    } catch (e) {
                        formations = [];
                    }
                }

                if (data.experiences) {
                    try {
                        experiences = typeof data.experiences === 'string'
                            ? JSON.parse(data.experiences)
                            : data.experiences;
                    } catch (e) {
                        experiences = [];
                    }
                }

                if (data.skills) {
                    skills = typeof data.skills === 'string'
                        ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
                        : data.skills || [];
                }

                setCandidate({
                    ...data,
                    formations,
                    experiences,
                    skills,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Candidat',
                    initials: getInitials(data.first_name, data.last_name),
                });

            } catch (error) {
                console.error("Error fetching candidate details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCandidateDetails();
        }
    }, [id]);

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${first}${last}` || 'CA';
    };

    const getStatusConfig = (status) => {
        const statusLower = status?.toLowerCase() || 'pending';
        switch (statusLower) {
            case 'pending':
                return {
                    text: 'EN ATTENTE',
                    style: 'bg-[#F9B134] text-black',
                    dotColor: 'bg-[#F9B134]',
                    borderColor: 'border-[#F9B134]'
                };
            case 'preselected':
                return {
                    text: 'PRÉSÉLECTIONNÉ',
                    style: 'bg-[#3B82F6] text-white',
                    dotColor: 'bg-[#3B82F6]',
                    borderColor: 'border-[#3B82F6]'
                };
            case 'accepted':
                return {
                    text: 'ACCEPTÉ',
                    style: 'bg-[#22C55E] text-white',
                    dotColor: 'bg-[#22C55E]',
                    borderColor: 'border-[#22C55E]'
                };
            case 'rejected':
                return {
                    text: 'REFUSÉ',
                    style: 'bg-[#EF4444] text-white',
                    dotColor: 'bg-[#EF4444]',
                    borderColor: 'border-[#EF4444]'
                };
            default:
                return {
                    text: 'INCONNU',
                    style: 'bg-gray-500 text-white',
                    dotColor: 'bg-gray-500',
                    borderColor: 'border-gray-500'
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            const statusMap = {
                'accepted': 'ACCEPTED',
                'rejected': 'REJECTED',
                'pending': 'PENDING',
                'preselected': 'PRESELECTED'
            };

            await applicationService.updateApplicationStatus(id, statusMap[newStatus] || newStatus.toUpperCase());
            setCandidate(prev => ({ ...prev, status: newStatus.toUpperCase() }));
        } catch (error) {
            console.error("Error updating status:", error);
            const errorMessage = error.response?.data?.error || "Erreur lors de la mise à jour du statut.";
            alert(errorMessage);
        } finally {
            setUpdatingStatus(false);
        }
    };



    const handleDownloadCV = async () => {
        if (!candidate?.student_id) return;
        try {
            const blob = await profileService.downloadStudentCV(candidate.student_id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cv_${candidate.first_name || 'candidat'}_${candidate.last_name || ''}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading CV:", error);
            alert("Erreur lors du téléchargement du CV. Le candidat n'a peut-être pas de CV.");
        }
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

    if (!candidate) {
        return (
            <div className="min-h-screen bg-black text-white flex font-sans">
                <EnterpriseSidebar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-gray-400 mb-4">Candidature non trouvée</p>
                        <button
                            onClick={() => navigate('/candidatures')}
                            className="px-4 py-2 bg-[#F9B134] text-black rounded-lg font-medium hover:bg-[#E5A02A] transition-colors"
                        >
                            Retour à la liste
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const statusConfig = getStatusConfig(candidate.status);

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            <EnterpriseSidebar />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <Link to="/candidatures" className="hover:text-white transition-colors">Candidatures</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <Link to="/candidatures" className="hover:text-white transition-colors">Toutes les candidatures</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-white">Détails de la candidature</span>
                    </nav>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Candidate Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header Card */}
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F9B134] to-[#E5A02A] flex items-center justify-center flex-shrink-0 text-black font-bold text-xl">
                                    {candidate.avatar_path ? (
                                        <img
                                            src={candidate.avatar_path}
                                            alt={candidate.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        candidate.initials
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{candidate.name}</h1>
                                            <p className="text-gray-400 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-[#F9B134]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                </svg>
                                                {candidate.student_title || candidate.education_level || 'Profil étudiant'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.style}`}>
                                                {statusConfig.text}
                                            </span>
                                            <p className="text-gray-500 text-sm mt-2">
                                                Postulé le {formatDate(candidate.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h2 className="text-lg font-bold text-white">À propos du candidat</h2>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    {candidate.bio || "Aucune description fournie par le candidat."}
                                </p>
                            </div>

                            {/* Formation Section */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-[#F9B134]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    <h2 className="text-lg font-bold text-white">Formation</h2>
                                </div>

                                {candidate.formations && candidate.formations.length > 0 ? (
                                    <div className="space-y-4">
                                        {candidate.formations.map((formation, index) => (
                                            <div key={index} className="border-l-2 border-[#F9B134] pl-4">
                                                <h3 className="font-semibold text-white">{formation.degree || formation.title}</h3>
                                                <p className="text-[#F9B134] text-sm">{formation.school || formation.institution}, {formation.location}</p>
                                                <p className="text-gray-500 text-sm">{formation.startDate || formation.start_date} - {formation.endDate || formation.end_date || 'Présent'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Aucune formation renseignée</p>
                                )}
                            </div>

                            {/* Skills Section */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg">⚡</span>
                                    <h2 className="text-lg font-bold text-white">Compétences</h2>
                                </div>

                                {candidate.skills && candidate.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-[#2A2620] text-gray-300 rounded-lg text-sm font-medium border border-[#3A362D] hover:border-[#F9B134] transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Aucune compétence renseignée</p>
                                )}
                            </div>

                            {/* Experience Section */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg">💼</span>
                                    <h2 className="text-lg font-bold text-white">Expériences</h2>
                                </div>

                                {candidate.experiences && candidate.experiences.length > 0 ? (
                                    <div className="space-y-4">
                                        {candidate.experiences.map((exp, index) => (
                                            <div key={index} className="border-l-2 border-[#F9B134] pl-4">
                                                <h3 className="font-semibold text-white">{exp.title || exp.position}</h3>
                                                <p className="text-[#F9B134] text-sm">{exp.company}</p>
                                                <p className="text-gray-500 text-sm">{exp.startDate || exp.start_date} - {exp.endDate || exp.end_date || 'Présent'}</p>
                                                {exp.description && (
                                                    <ul className="mt-2 space-y-1 text-gray-400 text-sm list-disc list-inside">
                                                        {exp.description.split('\n').filter(Boolean).map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Aucune expérience renseignée</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Actions & Status */}
                        <div className="space-y-6">
                            {/* Status Management */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Gestion du Statut</h3>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleStatusUpdate('pending')}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between transition-all duration-200 ${candidate.status?.toLowerCase() === 'pending'
                                            ? 'bg-[#F9B134]/20 border-2 border-[#F9B134] text-[#F9B134]'
                                            : 'bg-[#2A2620] border border-[#3A362D] text-gray-400 hover:bg-[#3A362D] hover:text-white'
                                            }`}
                                    >
                                        <span>En attente</span>
                                        {candidate.status?.toLowerCase() === 'pending' && (
                                            <svg className="w-5 h-5 text-[#F9B134]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleStatusUpdate('preselected')}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between transition-all duration-200 ${candidate.status?.toLowerCase() === 'preselected'
                                            ? 'bg-[#3B82F6]/20 border-2 border-[#3B82F6] text-[#3B82F6]'
                                            : 'bg-[#2A2620] border border-[#3A362D] text-gray-400 hover:bg-[#3A362D] hover:text-white'
                                            }`}
                                    >
                                        <span>Présélectionné</span>
                                        {candidate.status?.toLowerCase() === 'preselected' && (
                                            <svg className="w-5 h-5 text-[#3B82F6]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleStatusUpdate('accepted')}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between transition-all duration-200 ${candidate.status?.toLowerCase() === 'accepted'
                                            ? 'bg-[#22C55E]/20 border-2 border-[#22C55E] text-[#22C55E]'
                                            : 'bg-[#2A2620] border border-[#3A362D] text-gray-400 hover:bg-[#3A362D] hover:text-white'
                                            }`}
                                    >
                                        <span>Accepter</span>
                                        {candidate.status?.toLowerCase() === 'accepted' && (
                                            <svg className="w-5 h-5 text-[#22C55E]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between transition-all duration-200 ${candidate.status?.toLowerCase() === 'rejected'
                                            ? 'bg-[#EF4444]/20 border-2 border-[#EF4444] text-[#EF4444]'
                                            : 'bg-[#2A2620] border border-[#3A362D] text-gray-400 hover:bg-[#3A362D] hover:text-white'
                                            }`}
                                    >
                                        <span>Refuser</span>
                                        {candidate.status?.toLowerCase() === 'rejected' && (
                                            <svg className="w-5 h-5 text-[#EF4444]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Documents</h3>
                                {candidate.cv_path ? (
                                    <button
                                        onClick={handleDownloadCV}
                                        className="w-full py-3 rounded-lg bg-[#2A2620] border border-[#3A362D] text-white font-medium hover:bg-[#3A362D] transition-colors flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="text-left">
                                            <div className="font-medium">Télécharger le CV</div>
                                            <div className="text-xs text-gray-500">PDF</div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                ) : (
                                    <div className="text-gray-500 text-center py-4 bg-[#2A2620]/50 rounded-lg border border-[#3A362D]">
                                        Aucun CV disponible
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 text-center mt-2">Format original déposé par l'étudiant</p>
                            </div>

                            {/* Quick Contact */}
                            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Contact Rapide</h3>
                                <div className="space-y-3">
                                    {candidate.student_email && (
                                        <a
                                            href={`mailto:${candidate.student_email}`}
                                            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm truncate" title={candidate.student_email}>{candidate.student_email}</span>
                                        </a>
                                    )}
                                    {candidate.phone && (
                                        <a
                                            href={`tel:${candidate.phone}`}
                                            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="text-sm">{candidate.phone}</span>
                                        </a>
                                    )}
                                    {candidate.linkedin_url && (
                                        <a
                                            href={candidate.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-gray-300 hover:text-[#0A66C2] transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            <span className="text-sm">LinkedIn</span>
                                        </a>
                                    )}
                                    {candidate.github_url && (
                                        <a
                                            href={candidate.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            <span className="text-sm">GitHub</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 mb-16">
                        <button
                            onClick={() => navigate('/candidatures')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Retour à la liste</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CandidateDetailsPage;
