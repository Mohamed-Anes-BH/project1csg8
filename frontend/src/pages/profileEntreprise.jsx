import { useState } from 'react';
import { Link } from 'react-router-dom';

function ProfileEntreprise() {
    const [activeTab, setActiveTab] = useState('apropos');

    // Mock data
    const company = {
        name: 'Tech Solutions DZ',
        verified: true,
        tagline: 'Leader de l\'innovation numérique à Alger. Nous transformons les idées en solutions logicielles scalables.',
        location: 'Alger, Algérie',
        sector: 'Technologie & IT',
        size: '50-100 employés',
        website: 'techsolutions.dz',
        address: 'Sidi Yahia, Alger',
        socialLinks: {
            linkedin: '#',
            twitter: '#',
            youtube: '#'
        },
        about: [
            'Tech Solutions DZ est une entreprise technologique de premier plan basée à Alger, dédiée à fournir des solutions logicielles innovantes pour les entreprises de toutes tailles. Fondée en 2015, notre mission est de démocratiser l\'accès aux technologies de pointe en Algérie et en Afrique du Nord.',
            'Nous valorisons la créativité, l\'excellence technique et l\'apprentissage continu. Nos équipes travaillent sur des projets variés allant du développement d\'applications mobiles à l\'intelligence artificielle, en passant par le cloud computing.',
            'En rejoignant Tech Solutions DZ, vous intégrez un environnement dynamique où chaque voix compte et où le développement professionnel est une priorité absolue.'
        ],
        offers: [
            {
                id: 1,
                title: 'Développeur Full Stack (Stage PFE)',
                duration: '6 mois',
                location: 'Alger (Hydra)',
                type: 'Rémunéré',
                postedAgo: 'Il y a 2 jours'
            },
            {
                id: 2,
                title: 'Assistant Marketing Digital',
                duration: '3 mois',
                location: 'Alger (Centre)',
                type: 'Hybride',
                postedAgo: 'Il y a 5 jours'
            },
            {
                id: 3,
                title: 'Designer UI/UX Junior',
                duration: '6 mois',
                location: 'Télétravail',
                type: 'Rémunéré',
                postedAgo: 'Il y a 1 semaine'
            }
        ],
        gallery: [
            { id: 1, label: 'Collaboration' },
            { id: 2, label: 'Meeting' }
        ]
    };

    const tabs = [
        { key: 'apropos', label: 'À propos' },
        { key: 'offres', label: 'Offres', count: company.offers.length },
        { key: 'culture', label: 'Culture' }
    ];

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-zinc-800 to-zinc-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 to-zinc-900/50"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMjAiIGhlaWdodD0iNTAiIGZpbGw9IiM0NDQiIHJ4PSIyIi8+PHJlY3QgeD0iMzAiIHk9IjEwIiB3aWR0aD0iMjUiIGhlaWdodD0iNDUiIGZpbGw9IiM0NDQiIHJ4PSIyIi8+PC9zdmc+')] opacity-20"></div>
            </div>

            {/* Company Header */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="relative -mt-16 md:-mt-20 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-800 rounded-xl border-4 border-[#121212] flex items-center justify-center shadow-xl">
                            <svg className="w-12 h-12 md:w-16 md:h-16 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>

                        {/* Company Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
                                {company.verified && (
                                    <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                        </svg>
                                        Vérifié
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 mb-3 max-w-xl">{company.tagline}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {company.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {company.sector}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {company.size}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Candidature Spontanée
                            </button>
                            <button className="px-5 py-3 rounded-full border border-zinc-600 text-gray-300 hover:bg-zinc-800 transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Suivre
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-800 mb-8">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-4 flex items-center gap-2 transition-colors relative ${activeTab === tab.key
                                        ? 'text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {tab.key === 'apropos' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                    {tab.key === 'offres' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    )}
                                    {tab.key === 'culture' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    )}
                                </svg>
                                {tab.label}
                                {tab.count && (
                                    <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{tab.count}</span>
                                )}
                                {activeTab === tab.key && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F9B134]"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8 pb-12">
                    {/* Left Column */}
                    <div className="flex-1 space-y-8">
                        {/* About Section */}
                        <section className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#F9B134] rounded-full"></span>
                                À propos de l'entreprise
                            </h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed">
                                {company.about.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </section>

                        {/* Available Offers */}
                        <section className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#F9B134] rounded-full"></span>
                                    Offres disponibles
                                </h2>
                                <Link to="/offres" className="text-[#F9B134] text-sm hover:underline">
                                    Voir tout →
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {company.offers.map((offer) => (
                                    <div
                                        key={offer.id}
                                        className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#F9B134]/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white mb-1">{offer.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {offer.duration}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            </svg>
                                                            {offer.location}
                                                        </span>
                                                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                                            {offer.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500">{offer.postedAgo}</span>
                                                <button className="px-4 py-2 rounded-lg border border-zinc-600 text-white text-sm hover:bg-zinc-700 transition-colors">
                                                    Postuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Company Life Gallery */}
                        <section>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#F9B134] rounded-full"></span>
                                Vie chez Tech Solutions
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-amber-900/30 to-zinc-800 group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="text-white font-medium">Collaboration</span>
                                    </div>
                                </div>
                                <div className="grid grid-rows-2 gap-4">
                                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-orange-900/30 to-zinc-800 group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-yellow-900/30 to-zinc-800 group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        {/* Key Information */}
                        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 sticky top-6">
                            <h3 className="font-bold mb-6">Informations Clés</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Site Web</p>
                                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-[#F9B134] hover:underline flex items-center gap-1">
                                            {company.website}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Secteur</p>
                                        <p className="text-white">Développement Logiciel</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Taille</p>
                                        <p className="text-white">{company.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Siège</p>
                                        <p className="text-white">{company.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-6 pt-6 border-t border-zinc-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Réseaux Sociaux</p>
                                <div className="flex gap-3">
                                    <a href={company.socialLinks.linkedin} className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                    <a href={company.socialLinks.twitter} className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                        </svg>
                                    </a>
                                    <a href={company.socialLinks.youtube} className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800">
                            <div className="h-48 bg-gradient-to-br from-green-900/30 to-zinc-800 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 text-[#F9B134] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-400 text-sm">Alger, Algérie</p>
                                    </div>
                                </div>
                                <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-zinc-800/90 rounded-lg text-xs text-white hover:bg-zinc-700 transition-colors flex items-center gap-1">
                                    Voir sur Maps
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-zinc-800 py-6">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© 2023 DZ-Stagiaire. Tous droits réservés.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                        <a href="#" className="hover:text-white transition-colors">Conditions</a>
                        <a href="#" className="hover:text-white transition-colors">Aide</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default ProfileEntreprise;
