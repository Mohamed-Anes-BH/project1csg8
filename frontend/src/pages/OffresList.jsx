import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OfferListItem from '../component/OfferListItem';
import offerService from '../services/offerService';

function OffresList() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCompany = queryParams.get('company');

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedType]);

    // Main fetch effect
    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    search: debouncedSearchTerm || undefined,
                    type: selectedType !== 'ALL' ? selectedType : undefined,
                    company: initialCompany || undefined
                };
                console.log("Fetching offers with params:", params);
                const data = await offerService.getOffers(params);
                console.log("API Response:", data);
                setOffers(data.results || []);
                if (data.count) {
                    setTotalPages(Math.ceil(data.count / 9));
                } else if (data.results?.length === 0) {
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching offers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [currentPage, debouncedSearchTerm, selectedType, initialCompany]);

    // Handlers just update state now
    const handleTypeChange = (type) => {
        setSelectedType(type);
        // Page reset handled by effect
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Page reset handled by effect
    };

    const offerTypes = [
        { id: 'ALL', label: 'Tous' },
        { id: 'STAGE', label: 'Stage' },
        { id: 'PFE', label: 'PFE' },
        { id: 'EMPLOI', label: 'Emploi' }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Offres disponibles
                    </h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
                        Découvrez les meilleures opportunités de stages, PFE et premier emploi en Algérie.
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-10 space-y-5">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher par titre, entreprise, mot-clé..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-[#18181b] border border-[#27272a] text-white rounded-xl py-3.5 px-12 focus:outline-none focus:border-[#3f3f46] placeholder-gray-600 transition-all text-sm"
                        />
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex justify-center flex-wrap gap-2">
                        {offerTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => handleTypeChange(type.id)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all border ${selectedType === type.id
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-gray-400 border-[#27272a] hover:border-[#3f3f46] hover:text-white'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Offer List */}
                <div className="space-y-3 mb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-2 border-[#27272a] border-t-white rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">Chargement des offres...</p>
                        </div>
                    ) : offers.length > 0 ? (
                        offers.map((offer) => (
                            <OfferListItem
                                key={offer.id}
                                id={offer.id}
                                title={offer.title}
                                company={offer.company_name}
                                location={offer.location}
                                contractType={offer.duration}
                                type={offer.type}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <svg className="w-16 h-16 text-[#27272a] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 text-sm">Aucune offre trouvée</p>
                            <p className="text-gray-600 text-xs mt-1">Essayez de modifier vos critères de recherche</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#27272a] text-gray-400 hover:border-[#3f3f46] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <span className="text-sm text-gray-500 min-w-[120px] text-center">
                            Page <span className="text-white font-medium">{currentPage}</span> sur <span className="text-white font-medium">{totalPages}</span>
                        </span>

                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#27272a] text-gray-400 hover:border-[#3f3f46] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OffresList;
