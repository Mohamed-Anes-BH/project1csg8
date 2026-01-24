import { useState } from 'react';

function CandidateModal({ candidate, isOpen, onClose, onAccept, onReject, onPending }) {
    const [internalNote, setInternalNote] = useState('');

    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal - reduced max-width for 125% zoom */}
            <div className="relative bg-[#4A3F35] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#5D4F43]">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white">Profil du candidat</h2>
                        <p className="text-white/70 text-xs">Consultez le CV et gérez la candidature</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4">
                    {/* CV Preview */}
                    <div className="w-full md:w-2/5 bg-gradient-to-br from-[#D4A574] to-[#C4956A] rounded-lg p-4 sm:p-6 flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
                        <div className="relative bg-white rounded-lg p-3 sm:p-4 w-32 sm:w-40 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            {/* Paper fold effect */}
                            <div className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-bl-lg shadow-inner"></div>

                            <div className="text-center mb-2 sm:mb-3">
                                <h3 className="text-sm sm:text-base font-bold text-gray-800">CV</h3>
                                <p className="text-xs text-gray-500">Document</p>
                            </div>
                            <div className="space-y-1 sm:space-y-1.5">
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-full"></div>
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-2/3"></div>
                                <div className="mt-2 h-1 sm:h-1.5 bg-gray-200 rounded w-full"></div>
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-4/5"></div>
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-3/4"></div>
                                <div className="mt-2 h-1 sm:h-1.5 bg-gray-200 rounded w-full"></div>
                                <div className="h-1 sm:h-1.5 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Info & Actions */}
                    <div className="w-full md:w-3/5 flex flex-col">
                        {/* Info */}
                        <div className="mb-2 sm:mb-3">
                            <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">{candidate.name}</h3>
                            <p className="text-[#F9B134] font-medium mb-1 text-xs sm:text-sm">{candidate.degree}</p>
                            <p className="text-white/80 text-xs">{candidate.university}</p>
                        </div>

                        {/* Contact Buttons */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <button className="px-3 py-1.5 rounded-md bg-[#5D4F43] border border-[#6E5E50] text-white/80 hover:bg-[#6E5E50] hover:text-white transition-colors text-xs font-medium">
                                Contacter
                            </button>
                            <button className="px-3 py-1.5 rounded-md bg-[#5D4F43] border border-[#6E5E50] text-white/80 hover:bg-[#6E5E50] hover:text-white transition-colors text-xs font-medium">
                                Voir mes offres - Étudiant
                            </button>
                        </div>

                        {/* Internal Note Section */}
                        <div className="mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-sm">🔒</span>
                                <span className="text-white/90 font-semibold text-xs uppercase tracking-wide">Note Interne (Privé)</span>
                            </div>
                            <textarea
                                value={internalNote}
                                onChange={(e) => setInternalNote(e.target.value)}
                                placeholder="Ex: Bon profil, expérience pertinente... (Invisible pour l'étudiant)"
                                className="w-full h-14 sm:h-16 bg-[#5D4F43]/80 border border-[#6E5E50] rounded-md p-2 text-white placeholder-white/40 text-xs resize-none focus:outline-none focus:border-[#F9B134] transition-colors"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 mt-auto">
                            <button
                                onClick={() => onAccept(candidate.id)}
                                className="w-full py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accepter la candidature
                            </button>
                            <button
                                onClick={() => onReject(candidate.id)}
                                className="w-full py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Refuser
                            </button>
                            <button
                                onClick={() => onPending(candidate.id)}
                                className="w-full py-2 rounded-md bg-[#5D4F43] border border-[#6E5E50] text-white font-medium hover:bg-[#6E5E50] transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mettre en attente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateModal;
