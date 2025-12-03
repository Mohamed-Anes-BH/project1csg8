import { useState } from 'react';
import OfferCard from '../component/OfferCard';

function OffresList() {
    // Sample offers data
    const offers = [
        {
            id: 1,
            title: "Développeur Web Full-Stack",
            company: "Tech Solutions Inc.",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 2,
            title: "Stage en Marketing Digital",
            company: "Innovate DZ",
            location: "Oran",
            type: "PFE"
        },
        {
            id: 3,
            title: "Ingénieur en Intelligence Artificielle",
            company: "Algorithmia",
            location: "Constantine",
            type: "Emploi"
        },
        {
            id: 4,
            title: "Développeur Mobile (Stage)",
            company: "Startup Algeria",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 5,
            title: "Data Scientist (PFE)",
            company: "Code Masters",
            location: "Sétif",
            type: "PFE"
        },
        {
            id: 6,
            title: "UI/UX Designer (Stage)",
            company: "Digital Wave",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 7,
            title: "Chef de Projet IT (Emploi)",
            company: "Future Tech",
            location: "Annaba",
            type: "Emploi"
        },
        {
            id: 8,
            title: "Community Manager (Stage)",
            company: "Creative Minds",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 9,
            title: "Ingénieur DevOps (PFE)",
            company: "Data Insights",
            location: "Oran",
            type: "PFE"
        },
        {
            id: 10,
            title: "Développeur Backend Python",
            company: "CloudTech DZ",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 11,
            title: "Gestionnaire de Réseaux Sociaux",
            company: "Media Plus",
            location: "Blida",
            type: "PFE"
        },
        {
            id: 12,
            title: "Analyste Cybersécurité",
            company: "SecureNet Algeria",
            location: "Alger",
            type: "Emploi"
        },
        {
            id: 13,
            title: "Designer Graphique (Stage)",
            company: "Creative Studio",
            location: "Oran",
            type: "Stage"
        },
        {
            id: 14,
            title: "Ingénieur Réseau (PFE)",
            company: "Telecom Solutions",
            location: "Constantine",
            type: "PFE"
        },
        {
            id: 15,
            title: "Développeur Frontend React",
            company: "WebCraft",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 16,
            title: "Chef de Produit Digital",
            company: "E-Commerce DZ",
            location: "Tizi Ouzou",
            type: "Emploi"
        },
        {
            id: 17,
            title: "Testeur QA (Stage)",
            company: "Quality First",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 18,
            title: "Architecte Cloud (PFE)",
            company: "Cloud Masters",
            location: "Oran",
            type: "PFE"
        },
        {
            id: 19,
            title: "Spécialiste SEO/SEM",
            company: "Digital Marketing Pro",
            location: "Alger",
            type: "Stage"
        },
        {
            id: 20,
            title: "Business Analyst (Emploi)",
            company: "Consulting Group",
            location: "Sétif",
            type: "Emploi"
        },
        {
            id: 21,
            title: "Développeur IoT (PFE)",
            company: "Smart Solutions",
            location: "Constantine",
            type: "PFE"
        },
        {
            id: 22,
            title: "Responsable RH Digital",
            company: "HR Tech",
            location: "Alger",
            type: "Emploi"
        },
        {
            id: 23,
            title: "Stagiaire Data Engineer",
            company: "Big Data Corp",
            location: "Oran",
            type: "Stage"
        },
        {
            id: 24,
            title: "Expert en Machine Learning (PFE)",
            company: "AI Research Lab",
            location: "Alger",
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

    return (
        <div className="bg-black text-white min-h-screen">
            {/* Search Bar Section */}
            <div className="bg-zinc-900 py-6 px-6 mb-12">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher par mot-clé, compétence..."
                            className="w-full bg-black text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Liste des Offres
                        </h1>
                        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                            Trouvez votre prochaine opportunité professionnelle en Algérie.<br />
                            Stages, PFE et premiers emplois pour lancer votre carrière.
                        </p>
                    </div>

                    {/* Offer Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {currentOffers.map((offer) => (
                            <OfferCard
                                key={offer.id}
                                title={offer.title}
                                company={offer.company}
                                location={offer.location}
                                type={offer.type}
                            />
                        ))}
                    </div>

                    {/* Pagination - Only show if there are multiple pages */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <button
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition disabled:opacity-50"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-full font-semibold transition ${currentPage === page
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-transparent text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition disabled:opacity-50"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OffresList;
