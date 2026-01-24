import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import profileService from '../services/profileService';
import offerService from '../services/offerService';

function ProfileEntreprise() {
    const [activeTab, setActiveTab] = useState('apropos');
    const [companyData, setCompanyData] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profile, offersData] = await Promise.all([
                    profileService.getCompanyProfile(),
                    offerService.getMyOffers({ status: 'published' }) // Fetch published offers for display
                ]);
                setCompanyData(profile);
                setOffers(Array.isArray(offersData) ? offersData : (offersData.results || []));
            } catch (error) {
                console.error("Error fetching company data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
            </div>
        );
    }

    if (!companyData) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Erreur de chargement du profil</div>;
    }

    // Map backend data to UI structure
    // Assuming backend returns: user { ... }, name, description, website, address, size, industry, logo, etc.
    const company = {
        name: companyData.company_name || "Nom Entreprise",
        verified: companyData.is_verified || false,
        tagline: companyData.tagline || (companyData.description ? companyData.description.substring(0, 100) + "..." : "Une entreprise innovante."),
        location: companyData.address || "Algérie", // Simplify or use specific field if available
        sector: companyData.industry || "Technologie",
        size: companyData.size || "Non spécifié",
        website: companyData.website || "",
        address: companyData.address || "Adresse non renseignée",
        socialLinks: companyData.social_links || {
            linkedin: '#',
            twitter: '#',
            website: companyData.website
        },
        about: companyData.description ? companyData.description.split('\n') : ["Aucune description disponible."],
        logo: companyData.logo
    };

    const tabs = [
        { key: 'apropos', label: 'À propos' },
        { key: 'offres', label: 'Offres', count: offers.length }
    ];

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Aujourd'hui";
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
        if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
        return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header/Banner Section */}
            <div className="max-w-7xl mx-auto px-4 pt-4">
                <div className="relative rounded-2xl overflow-hidden bg-[#26231D] border border-[#3A362D]">
                    {/* Cover Image */}
                    <div className="h-48 md:h-64 bg-gradient-to-r from-zinc-800 to-zinc-700 relative">
                        {/* Placeholder generic cover if no cover image in backend */}
                        <img
                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                            alt="Corporate Headquarters"
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1C16] via-transparent to-transparent"></div>
                    </div>

                    {/* Company Info Overlay */}
                    <div className="px-6 pb-6 relative -mt-12 flex flex-col md:flex-row items-end gap-5">
                        {/* Logo */}
                        <div className="w-24 h-24 bg-black rounded-xl border-4 border-[#26231D] flex items-center justify-center shadow-xl flex-shrink-0 relative z-10 overflow-hidden">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            )}
                            {company.verified && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-black rounded-full p-0.5 border-2 border-[#26231D]">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 mb-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                                {company.verified && (
                                    <span className="bg-[#F9B134]/20 text-[#F9B134] text-[10px] px-2 py-0.5 rounded-full border border-[#F9B134]/30 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Entreprise vérifiée
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2 max-w-2xl leading-snug">{company.tagline}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-[#F9B134]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {company.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-[#F9B134]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm13 1.5a1.5 1.5 0 011.5 1.5v7.987a1.5 1.5 0 01-1.5 1.5h-1.5a1.5 1.5 0 01-1.5-1.5v-7.987a1.5 1.5 0 011.5-1.5h1.5z" clipRule="evenodd" />
                                    </svg>
                                    {company.sector}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-[#F9B134]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                    {company.size}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mb-1 transform translate-y-4">
                            <Link
                                to="/dashboard-entreprise"
                                className="px-6 py-2.5 bg-transparent border border-[#F9B134] text-[#F9B134] text-sm font-bold rounded-full hover:bg-[#F9B134]/10 hover:shadow-[0_0_15px_rgba(249,177,52,0.4)] transition-all duration-300 flex items-center gap-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Tableau de bord
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 border-t border-[#3A362D]">
                        <div className="flex gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-3 flex items-center gap-2 text-xs font-medium transition-colors relative ${activeTab === tab.key
                                        ? 'text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className="text-[10px] bg-[#3A362D] px-1.5 py-0.5 rounded-full text-gray-300">{tab.count}</span>
                                    )}
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F9B134]"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column */}
                    <div className="flex-1 space-y-6">
                        {/* Content based on Active Tab */}
                        {activeTab === 'apropos' && (
                            <>
                                {/* About Section */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 bg-[#F9B134] rounded-full"></div>
                                    <h2 className="text-lg font-bold text-white">À propos de l'entreprise</h2>
                                </div>
                                <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                                    <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                                        {company.about.map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'offres' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-lg font-bold text-white">Offres disponibles</h2>
                                    <Link to="/creation-offre" className="text-[#F9B134] text-xs hover:underline flex items-center gap-1">
                                        + Créer une offre
                                    </Link>
                                </div>
                                {offers.length === 0 ? (
                                    <div className="p-8 text-center bg-[#26231D] rounded-xl border border-[#3A362D] text-gray-500 text-sm">
                                        Aucune offre active pour le moment.
                                    </div>
                                ) : (
                                    offers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            className="bg-[#26231D] rounded-xl p-4 border border-[#3A362D] hover:border-[#F9B134]/30 transition-colors group"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#3A362D] flex items-center justify-center flex-shrink-0 border border-[#4A463D] group-hover:border-[#F9B134]/30 transition-colors">
                                                        <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm mb-1">{offer.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {humanizeDuration(offer.duration) || offer.duration}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                {company.location}
                                                            </span>
                                                            <span className="bg-[#F9B134]/10 text-[#F9B134] px-2 py-0.5 rounded-full border border-[#F9B134]/20">
                                                                {offer.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end sm:self-center">
                                                    <span className="text-[10px] text-gray-600">{getTimeAgo(offer.created_at)}</span>
                                                    <Link to={`/gestion-offres/${offer.id}`} className="px-3 py-1.5 rounded-lg border border-[#3A362D] text-white text-xs font-medium hover:bg-[#3A362D] transition-colors">
                                                        Voir
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'culture' && (
                            <div className="p-8 text-center bg-[#26231D] rounded-xl border border-[#3A362D] text-gray-500 text-sm">
                                La section Culture est vide pour le moment.
                            </div>
                        )}

                        {/* Recent Offers (Always visible on 'apropos' tab under About?) 
                          The original mock had "Available Offers" under About.
                          I'll keep it there if we are on 'apropos' tab, limited to 3
                        */}
                        {activeTab === 'apropos' && offers.length > 0 && (
                            <>
                                <div className="flex items-center justify-between mb-2 mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-[#F9B134] rounded-full"></div>
                                        <h2 className="text-lg font-bold text-white">Dernières offres</h2>
                                    </div>
                                    <button onClick={() => setActiveTab('offres')} className="text-[#F9B134] text-xs hover:underline flex items-center gap-1">
                                        Voir tout
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {offers.slice(0, 3).map((offer) => (
                                        <div
                                            key={offer.id}
                                            className="bg-[#26231D] rounded-xl p-4 border border-[#3A362D] hover:border-[#F9B134]/30 transition-colors group"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#3A362D] flex items-center justify-center flex-shrink-0 border border-[#4A463D] group-hover:border-[#F9B134]/30 transition-colors">
                                                        <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm mb-1">{offer.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {company.location}
                                                            </span>
                                                            <span className="bg-[#F9B134]/10 text-[#F9B134] px-2 py-0.5 rounded-full border border-[#F9B134]/20">
                                                                {offer.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link to={`/gestion-offres/${offer.id}`} className="px-3 py-1.5 rounded-lg border border-[#3A362D] text-white text-xs font-medium hover:bg-[#3A362D] transition-colors self-end sm:self-center">
                                                    Voir
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:w-80 space-y-4">
                        {/* Key Information */}
                        <div className="bg-[#26231D] rounded-xl p-5 border border-[#3A362D]">
                            <h3 className="font-bold text-white text-sm mb-4">Informations Clés</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#3A362D] flex items-center justify-center flex-shrink-0 border border-[#4A463D]">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Site Web</p>
                                        {company.website ? (
                                            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-white text-xs hover:text-[#F9B134] transition-colors flex items-center gap-1">
                                                Voir notre site web
                                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <p className="text-gray-500 text-xs">Non renseigné</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#3A362D] flex items-center justify-center flex-shrink-0 border border-[#4A463D]">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Secteur</p>
                                        <p className="text-white text-xs">{company.sector}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#3A362D] flex items-center justify-center flex-shrink-0 border border-[#4A463D]">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Taille</p>
                                        <p className="text-white text-xs">{company.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#3A362D] flex items-center justify-center flex-shrink-0 border border-[#4A463D]">
                                        <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Siège</p>
                                        <p className="text-white text-xs">{company.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map (Placeholder) */}
                        {/* Why Join Us Card */}
                        <div className="bg-gradient-to-br from-[#26231D] to-[#3A362D] rounded-xl p-5 border border-[#3A362D] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-[#F9B134]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white text-sm mb-2 relative z-10">Pourquoi nous rejoindre ?</h3>
                            <p className="text-xs text-gray-400 leading-relaxed relative z-10 mb-3">
                                Nous offrons un environnement dynamique, des projets innovants et des opportunités de croissance continue pour nos stagiaires.
                            </p>
                            <div className="flex items-center gap-2 relative z-10">
                                <span className="text-[10px] bg-[#F9B134]/10 text-[#F9B134] px-2 py-1 rounded border border-[#F9B134]/20">Innovation</span>
                                <span className="text-[10px] bg-[#F9B134]/10 text-[#F9B134] px-2 py-1 rounded border border-[#F9B134]/20">Impact</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#3A362D] py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© 2023 DZ-Stagiaire. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

// Helper to handle duration format if needed or assume string
const humanizeDuration = (duration) => {
    return duration;
};

export default ProfileEntreprise;
