import { Link } from 'react-router-dom';

function OfferListItem({ id, title, company, location, contractType, type }) {
    const getTypeBadgeStyle = () => {
        switch (type.toUpperCase()) {
            case 'STAGE':
                return 'bg-[#F9B134] text-black';
            case 'PFE':
                return 'bg-[#F9B134] text-black';
            case 'EMPLOI':
                return 'bg-zinc-700 text-white';
            default:
                return 'bg-[#F9B134] text-black';
        }
    };

    return (
        <div className="bg-zinc-900/60 rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side - Job info */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                        {/* Company */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{company}</span>
                        </div>
                        {/* Location */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{location}</span>
                        </div>
                        {/* Contract Type */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{contractType}</span>
                        </div>
                    </div>
                </div>

                {/* Right side - Badge and Button */}
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getTypeBadgeStyle()}`}>
                        {type}
                    </span>
                    <Link
                        to={`/offre/${id}`}
                        className="px-6 py-2 rounded-lg border border-[#F9B134] text-[#F9B134] font-medium hover:bg-[#F9B134] hover:text-black transition-all duration-300"
                    >
                        Voir
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OfferListItem;
