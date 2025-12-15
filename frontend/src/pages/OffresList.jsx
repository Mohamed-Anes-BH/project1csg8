import { useState } from 'react';
import OfferListItem from '../component/OfferListItem';

function OffresList() {
    // Sample offers data with contract types
    const offers = [
        {
            id: 1,
            title: "Développeur Web Full-Stack",
            company: "Tech Solutions Inc.",
            location: "Alger",
            contractType: "Temps plein",
            type: "Stage"
        },
        {
            id: 2,
            title: "Stage en Marketing Digital",
            company: "Innovate DZ",
            location: "Oran",
            contractType: "Temps partiel",
            type: "PFE"
        },
        {
            id: 3,
            title: "Ingénieur en Intelligence Artificielle",
            company: "Algorithmia",
            location: "Constantine",
            contractType: "CDI",
            type: "Emploi"
        },
        {
            id: 4,
            title: "Développeur Mobile (Stage)",
            company: "Startup Algeria",
            location: "Alger",
            contractType: "Temps plein",
            type: "Stage"
        },
        {
            id: 5,
            title: "Data Scientist",
            company: "Code Masters",
            location: "Sétif",
            contractType: "Hybride",
            type: "PFE"
        },
        {
            id: 6,
            title: "UI/UX Designer",
            company: "Digital Wave",
            location: "Alger",
            contractType: "Télétravail",
            type: "Stage"
        },
        {
            id: 7,
            title: "Chef de Projet IT",
            company: "Future Tech",
            location: "Annaba",
            contractType: "CDD",
            type: "Emploi"
        },
        {
            id: 8,
            title: "Community Manager",
            company: "Creative Minds",
            location: "Alger",
            contractType: "Temps partiel",
            type: "Stage"
        },
        {
            id: 9,
            title: "Ingénieur DevOps",
            company: "Data Insights",
            location: "Oran",
            contractType: "Temps plein",
            type: "PFE"
        },
        {
            id: 10,
            title: "Développeur Backend Python",
            company: "CloudTech DZ",
            location: "Alger",
            contractType: "CDI",
            type: "Stage"
        },
        {
            id: 11,
            title: "Gestionnaire de Réseaux Sociaux",
            company: "Media Plus",
            location: "Blida",
            contractType: "Temps partiel",
            type: "PFE"
        },
        {
            id: 12,
            title: "Analyste Cybersécurité",
            company: "SecureNet Algeria",
            location: "Alger",
            contractType: "CDI",
            type: "Emploi"
        },
        {
            id: 13,
            title: "Designer Graphique",
            company: "Creative Studio",
            location: "Oran",
            contractType: "Temps plein",
            type: "Stage"
        },
        {
            id: 14,
            title: "Ingénieur Réseau",
            company: "Telecom Solutions",
            location: "Constantine",
            contractType: "Hybride",
            type: "PFE"
        },
        {
            id: 15,
            title: "Développeur Frontend React",
            company: "WebCraft",
            location: "Alger",
            contractType: "Temps plein",
            type: "Stage"
        },
        {
            id: 16,
            title: "Chef de Produit Digital",
            company: "E-Commerce DZ",
            location: "Tizi Ouzou",
            contractType: "CDI",
            type: "Emploi"
        },
        {
            id: 17,
            title: "Testeur QA",
            company: "Quality First",
            location: "Alger",
            contractType: "Temps plein",
            type: "Stage"
        },
        {
            id: 18,
            title: "Architecte Cloud",
            company: "Cloud Masters",
            location: "Oran",
            contractType: "Hybride",
            type: "PFE"
        },
        {
            id: 19,
            title: "Spécialiste SEO/SEM",
            company: "Digital Marketing Pro",
            location: "Alger",
            contractType: "Télétravail",
            type: "Stage"
        },
        {
            id: 20,
            title: "Business Analyst",
            company: "Consulting Group",
            location: "Sétif",
            contractType: "CDI",
            type: "Emploi"
        },
        {
            id: 21,
            title: "Développeur IoT",
            company: "Smart Solutions",
            location: "Constantine",
            contractType: "Temps plein",
            type: "PFE"
        },
        {
            id: 22,
            title: "Responsable RH Digital",
            company: "HR Tech",
            location: "Alger",
            contractType: "CDI",
            type: "Emploi"
        },
        {
            id: 23,
            title: "Stagiaire Data Engineer",
            company: "Big Data Corp",
            location: "Oran",
            contractType: "Temps plein",
            type: "Stage"
        },
        {
            id: 24,
            title: "Expert en Machine Learning",
            company: "AI Research Lab",
            location: "Alger",
            contractType: "Hybride",
            type: "PFE"
        }
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Calculate pagination
    const totalPages = Math.ceil(offers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOffers = offers.slice(startIndex, endIndex);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page, last page, and pages around current
            let start = Math.max(1, currentPage - 1);
            let end = Math.min(totalPages, currentPage + 1);

            if (currentPage <= 2) {
                end = Math.min(maxVisiblePages - 1, totalPages);
            }
            if (currentPage >= totalPages - 1) {
                start = Math.max(1, totalPages - maxVisiblePages + 2);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold italic mb-4">
                        Liste des Offres
                    </h1>
                    <p className="text-gray-400 text-base max-w-2xl mx-auto">
                        Trouvez votre prochaine opportunité professionnelle en Algérie.<br />
                        Stages, PFE et premiers emplois pour lancer votre carrière.
                    </p>
                </div>

                {/* Offer List */}
                <div className="space-y-4 mb-12">
                    {currentOffers.map((offer) => (
                        <OfferListItem
                            key={offer.id}
                            id={offer.id}
                            title={offer.title}
                            company={offer.company}
                            location={offer.location}
                            contractType={offer.contractType}
                            type={offer.type}
                        />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        {/* Previous Button */}
                        <button
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-full font-semibold transition-all duration-200 ${currentPage === page
                                        ? 'bg-zinc-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
