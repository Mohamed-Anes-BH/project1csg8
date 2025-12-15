function CandidateModal({ candidate, isOpen, onClose, onAccept, onReject, onPending }) {
    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 rounded-2xl border border-zinc-700 max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <div>
                        <h2 className="text-xl font-bold text-white">Profil du candidat</h2>
                        <p className="text-gray-400 text-sm">Consultez le CV et gérez la candidature</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* CV Preview */}
                    <div className="flex-1 bg-gradient-to-br from-[#D4A574] to-[#C4956A] rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                        <div className="bg-white rounded-lg p-6 w-48 shadow-lg">
                            <div className="text-center mb-4">
                                <h3 className="text-sm font-bold text-gray-800">CV</h3>
                                <p className="text-xs text-gray-500">Document</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                                <div className="mt-4 h-2 bg-gray-200 rounded w-full"></div>
                                <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Info & Actions */}
                    <div className="flex-1 flex flex-col">
                        {/* Info */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
                            <p className="text-[#F9B134] font-medium mb-2">{candidate.degree}</p>
                            <p className="text-gray-400 text-sm">{candidate.university}</p>
                        </div>

                        {/* Contact Button */}
                        <div className="flex items-center gap-3 mb-6">
                            <button className="px-4 py-2 rounded-lg border border-zinc-600 text-gray-300 hover:bg-zinc-800 transition-colors">
                                Contacter
                            </button>
                            <button className="p-2 rounded-lg border border-zinc-600 text-gray-300 hover:bg-zinc-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 mt-auto">
                            <button
                                onClick={() => onAccept(candidate.id)}
                                className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accepter la candidature
                            </button>
                            <button
                                onClick={() => onReject(candidate.id)}
                                className="w-full py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Refuser
                            </button>
                            <button
                                onClick={() => onPending(candidate.id)}
                                className="w-full py-3 rounded-lg bg-zinc-700 text-white font-medium hover:bg-zinc-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
