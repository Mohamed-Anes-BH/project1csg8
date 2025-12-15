import { Link, useParams } from 'react-router-dom';

function DetailleOffer() {
    const { id } = useParams();

    // Mock data - In a real app, this would come from an API based on the id
    const offerData = {
        title: "Développeur Web Full-Stack (Stage PFE)",
        company: "Tech Solutions Inc.",
        location: "Alger, Algérie",
        type: "PFE",
        duration: "6 mois",
        status: "Ouvert",
        publishedDate: "24 Juillet 2024",
        views: 123,
        companyDescription: "Leader dans le développement de solutions logicielles sur mesure pour les entreprises B2B.",
        description: [
            "Nous recherchons un(e) stagiaire Développeur Web Full-Stack passionné(e) pour rejoindre notre équipe dynamique. Dans le cadre de votre Projet de Fin d'Études (PFE), vous participerez activement au développement et à l'amélioration de nos applications web innovantes.",
            "Vous travaillerez sur des technologies modernes, de la conception de l'interface utilisateur à la gestion des bases de données et des API. C'est une excellente opportunité de monter en compétences, d'apprendre de développeurs expérimentés et d'avoir un impact réel sur nos produits."
        ],
        projectMission: {
            intro: "Le projet principal consistera à développer un nouveau module de reporting pour notre plateforme SaaS. Vous serez responsable de :",
            tasks: [
                "La conception et l'implémentation de l'interface front-end en React.",
                "Le développement des endpoints API nécessaires avec Node.js/Express.",
                "L'intégration avec notre base de données PostgreSQL.",
                "La rédaction de tests unitaires et d'intégration pour garantir la qualité du code."
            ]
        },
        skills: ["React", "Node.js", "JavaScript", "SQL", "Git", "Communication"]
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-8">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        Accueil
                    </Link>
                    <span className="text-gray-500">/</span>
                    <Link to="/offres" className="text-[#F9B134] hover:text-[#e5a02a] transition-colors">
                        Offres
                    </Link>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-400">Développeur Web Full-Stack</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Main Content */}
                    <div className="flex-1">
                        {/* Title Section */}
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                            {offerData.title}
                        </h1>

                        {/* Company and Location */}
                        <p className="text-gray-400 mb-6">
                            {offerData.company} - {offerData.location}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <span className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700">
                                {offerData.type}
                            </span>
                            <span className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700">
                                {offerData.duration}
                            </span>
                            <span className="bg-green-600 text-white text-sm px-4 py-2 rounded-full">
                                {offerData.status}
                            </span>
                        </div>

                        {/* Description Section */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Description de l'offre</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                {offerData.description.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </section>

                        {/* Project/Mission Section */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">À propos du projet/mission</h2>
                            <p className="text-gray-300 mb-4">{offerData.projectMission.intro}</p>
                            <ul className="space-y-3 text-gray-300">
                                {offerData.projectMission.tasks.map((task, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="text-[#F9B134] mt-1">•</span>
                                        <span>{task}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Skills Section */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Compétences Requises</h2>
                            <div className="flex flex-wrap gap-3">
                                {offerData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700 hover:border-[#F9B134] transition-colors"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Footer Info */}
                        <div className="flex flex-wrap items-center justify-between pt-6 border-t border-zinc-800 text-sm text-gray-400">
                            <span>Publié le: {offerData.publishedDate}</span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {offerData.views} vues
                            </span>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        {/* Apply Button */}
                        <button className="w-full bg-[#F9B134] hover:bg-[#e5a02a] text-black font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#F9B134]/20 hover:shadow-[#F9B134]/40">
                            Postuler en 1 clic
                            <svg
                                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>

                        {/* Company Card */}
                        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                            {/* Company Logo */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#1a3a4a] to-[#0d2533] rounded-xl flex items-center justify-center border border-zinc-700">
                                    <div className="text-center">
                                        <div className="text-[#4ECDC4] font-bold text-sm">TECH</div>
                                        <div className="text-[#4ECDC4] text-[10px]">solutions inc</div>
                                    </div>
                                </div>
                            </div>

                            {/* Company Name */}
                            <h3 className="text-[#F9B134] font-bold text-lg text-center mb-3">
                                {offerData.company}
                            </h3>

                            {/* Company Description */}
                            <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                                {offerData.companyDescription}
                            </p>

                            {/* View All Offers Button */}
                            <Link
                                to="/offres"
                                className="block w-full text-center py-3 px-4 rounded-full border border-[#F9B134] text-[#F9B134] font-medium hover:bg-[#F9B134]/10 transition-colors"
                            >
                                Voir toutes les offres
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DetailleOffer;
