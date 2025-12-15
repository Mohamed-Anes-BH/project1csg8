import { Link } from 'react-router-dom';
import StatCard from '../component/StatCard';
import RecommendationCard from '../component/RecommendationCard';

function TableBordEtudient() {
    // Mock data - In a real app, this would come from an API
    const userData = {
        name: "Ahmed",
        stats: {
            candidatures: 12,
            savedOffers: 5,
            profileViews: 28
        },
        profileCompletion: 75
    };

    const recentApplications = [
        {
            id: 1,
            poste: "Développeur Full-Stack",
            entreprise: "Yassir",
            date: "15 Mai 2024",
            statut: "Vue",
            statutType: "viewed"
        },
        {
            id: 2,
            poste: "Data Analyst Intern",
            entreprise: "Ooredoo",
            date: "12 Mai 2024",
            statut: "En attente",
            statutType: "pending"
        },
        {
            id: 3,
            poste: "UI/UX Designer",
            entreprise: "Go Platform",
            date: "10 Mai 2024",
            statut: "Acceptée",
            statutType: "accepted"
        }
    ];

    const savedOffers = [
        {
            id: 1,
            title: "Stage Développeur Web",
            company: "TechCorp Algeria",
            icon: "code",
            color: "#F9B134"
        },
        {
            id: 2,
            title: "Stage en Marketing Digital",
            company: "BrandUp",
            icon: "chart",
            color: "#F9B134"
        },
        {
            id: 3,
            title: "Stagiaire Graphiste",
            company: "Creative DZ",
            icon: "design",
            color: "#F9B134"
        }
    ];

    const recommendations = [
        {
            id: 1,
            title: "Ingénieur Logiciel (Stage)",
            company: "Cevital Group",
            location: "Béjaïa, Algérie"
        },
        {
            id: 2,
            title: "Assistant Chef de Projet",
            company: "Sonatrach",
            location: "Alger, Algérie"
        },
        {
            id: 3,
            title: "Stagiaire en Cybersécurité",
            company: "Djezzy",
            location: "Alger, Algérie"
        }
    ];

    const getStatusStyle = (type) => {
        switch (type) {
            case 'viewed':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'pending':
                return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
            case 'accepted':
                return 'bg-green-500/20 text-green-400 border border-green-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    const getOfferIcon = (iconType) => {
        switch (iconType) {
            case 'code':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                );
            case 'chart':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                );
            case 'design':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold italic mb-2">
                        Bienvenue, {userData.name}!
                    </h1>
                    <p className="text-gray-400">
                        Voici un aperçu de votre activité et des opportunités qui vous attendent.
                    </p>
                </div>

                {/* Stats and Profile Completion Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Stats Cards */}
                    <StatCard label="Candidatures envoyées" value={userData.stats.candidatures} />
                    <StatCard label="Offres sauvegardées" value={userData.stats.savedOffers} />
                    <StatCard label="Vues du profil" value={userData.stats.profileViews} />

                    {/* Profile Completion Card */}
                    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium">Complétude du profil</span>
                            <span className="text-[#F9B134] font-bold">{userData.profileCompletion}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2 mb-4">
                            <div
                                className="bg-[#F9B134] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${userData.profileCompletion}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Complétez votre profil pour augmenter vos chances.
                        </p>
                        <Link
                            to="/profile-etudiant"
                            className="block w-full text-center py-2 px-4 rounded-full border border-[#F9B134] text-[#F9B134] font-medium hover:bg-[#F9B134]/10 transition-colors text-sm"
                        >
                            Compléter mon profil
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Applications Table */}
                    <div className="lg:col-span-2 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Candidatures Récentes</h2>

                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-4 gap-4 text-gray-500 text-sm pb-4 border-b border-zinc-800">
                            <span>Poste</span>
                            <span>Entreprise</span>
                            <span>Date</span>
                            <span>Statut</span>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-4 mt-4">
                            {recentApplications.map((app) => (
                                <div key={app.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 py-3 border-b border-zinc-800/50 last:border-0">
                                    <span className="font-medium text-white">
                                        <span className="md:hidden text-gray-500 text-sm">Poste: </span>
                                        {app.poste}
                                    </span>
                                    <span className="text-gray-400">
                                        <span className="md:hidden text-gray-500 text-sm">Entreprise: </span>
                                        {app.entreprise}
                                    </span>
                                    <span className="text-gray-400">
                                        <span className="md:hidden text-gray-500 text-sm">Date: </span>
                                        {app.date}
                                    </span>
                                    <span>
                                        <span className="md:hidden text-gray-500 text-sm">Statut: </span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.statutType)}`}>
                                            {app.statut}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saved Offers */}
                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Offres Sauvegardées</h2>
                        <div className="space-y-4">
                            {savedOffers.map((offer) => (
                                <div key={offer.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${offer.color}20`, color: offer.color }}
                                    >
                                        {getOfferIcon(offer.icon)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm">{offer.title}</h3>
                                        <p className="text-gray-400 text-sm">{offer.company}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                <div>
                    <h2 className="text-xl font-bold mb-6">Recommandations pour vous</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations.map((rec) => (
                            <RecommendationCard
                                key={rec.id}
                                title={rec.title}
                                company={rec.company}
                                location={rec.location}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TableBordEtudient;
