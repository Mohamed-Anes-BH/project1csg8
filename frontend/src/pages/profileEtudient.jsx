import { Link } from 'react-router-dom';
import ProfileSection from '../component/ProfileSection';

function ProfileEtudient() {
    // Mock data - In a real app, this would come from an API
    const profileData = {
        name: "Amine Ait-Said",
        role: "Étudiant en Master Informatique",
        bio: "Développeur passionné avec une expertise en développement web full-stack, cherchant activement une opportunité de stage de fin d'études pour appliquer mes compétences et contribuer à des projets innovants.",
        avatar: null, // Will use placeholder
        formations: [
            {
                id: 1,
                title: "Master en Informatique, Spécialité IL",
                institution: "Université des Sciences et de la Technologie Houari Boumediene",
                period: "2022 - 2024"
            },
            {
                id: 2,
                title: "Licence en Informatique",
                institution: "Université des Sciences et de la Technologie Houari Boumediene",
                period: "2019 - 2022"
            },
            {
                id: 3,
                title: "Baccalauréat Scientifique",
                institution: "Lycée Les Frères Hamia",
                period: "2019"
            }
        ],
        competences: [
            { name: "JavaScript", highlighted: false },
            { name: "TypeScript", highlighted: false },
            { name: "React", highlighted: false },
            { name: "Node.js", highlighted: false },
            { name: "Express.js", highlighted: false },
            { name: "MongoDB", highlighted: false },
            { name: "SQL", highlighted: false },
            { name: "Docker", highlighted: false },
            { name: "Git", highlighted: true },
            { name: "Tailwind CSS", highlighted: true }
        ],
        experiences: [
            {
                id: 1,
                title: "Développeur Web Full-Stack (Projet de fin d'année)",
                company: "Projet Académique",
                period: "Sep 2023 - Juin 2024",
                description: "Conception et développement d'une plateforme de e-commerce complète en utilisant MERN Stack (MongoDB, Express, React, Node.js). Mise en place de l'authentification JWT et intégration de l'API Stripe pour les paiements."
            },
            {
                id: 2,
                title: "Stage en Développement Front-End",
                company: "Yassir",
                period: "Juin 2023 - Août 2023",
                description: "Contribution à l'amélioration de l'interface utilisateur de l'application client. Intégration de nouvelles fonctionnalités en React et TypeScript, et participation aux revues de code et aux sprints agiles."
            }
        ],
        links: [
            { name: "GitHub", url: "https://github.com", icon: "github" },
            { name: "Portfolio", url: "https://portfolio.com", icon: "link" }
        ]
    };

    const handleEdit = (section) => {
        console.log(`Editing ${section}`);
        // TODO: Implement edit functionality
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="bg-zinc-900/50 rounded-2xl p-6 md:p-8 border border-zinc-800 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-zinc-700 bg-gradient-to-br from-zinc-600 to-zinc-800">
                                {profileData.avatar ? (
                                    <img
                                        src={profileData.avatar}
                                        alt={profileData.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-16 h-16 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{profileData.name}</h1>
                                    <p className="text-[#F9B134] font-medium mb-4">{profileData.role}</p>
                                    <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                                        {profileData.bio}
                                    </p>
                                </div>
                                <button className="self-start px-6 py-2.5 rounded-full border border-[#F9B134] text-[#F9B134] font-medium hover:bg-[#F9B134]/10 transition-colors whitespace-nowrap">
                                    Contacter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formations Section */}
                <div className="mb-6">
                    <ProfileSection title="Formations" onEdit={() => handleEdit('formations')}>
                        <div className="space-y-6">
                            {profileData.formations.map((formation) => (
                                <div key={formation.id} className="flex gap-4">
                                    {/* Graduation Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-[#F9B134]/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#F9B134]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {/* Formation Details */}
                                    <div>
                                        <h3 className="font-semibold text-white">{formation.title}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {formation.institution} | {formation.period}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ProfileSection>
                </div>

                {/* Compétences Section */}
                <div className="mb-6">
                    <ProfileSection title="Compétences" onEdit={() => handleEdit('competences')}>
                        <div className="flex flex-wrap gap-3">
                            {profileData.competences.map((skill, index) => (
                                <span
                                    key={index}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${skill.highlighted
                                            ? 'bg-[#F9B134] text-black'
                                            : 'bg-zinc-800 text-white border border-zinc-700 hover:border-[#F9B134]'
                                        }`}
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </ProfileSection>
                </div>

                {/* Expériences Section */}
                <div className="mb-6">
                    <ProfileSection title="Expériences" onEdit={() => handleEdit('experiences')}>
                        <div className="space-y-6">
                            {profileData.experiences.map((exp) => (
                                <div key={exp.id} className="border-l-2 border-zinc-700 pl-4">
                                    <h3 className="font-semibold text-white mb-1">{exp.title}</h3>
                                    <p className="text-[#F9B134] text-sm mb-2">
                                        {exp.company} | {exp.period}
                                    </p>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ProfileSection>
                </div>

                {/* Liens Externes Section */}
                <div className="mb-6">
                    <ProfileSection title="Liens Externes" onEdit={() => handleEdit('links')}>
                        <div className="flex flex-wrap gap-4">
                            {profileData.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                                >
                                    {link.icon === 'github' ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    )}
                                    <span className="group-hover:underline">{link.name}</span>
                                </a>
                            ))}
                        </div>
                    </ProfileSection>
                </div>
            </main>
        </div>
    );
}

export default ProfileEtudient;
