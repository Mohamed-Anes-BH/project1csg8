import { Link } from 'react-router-dom';

function OfferCard({ title, company, location, type }) {
    // Determine badge color based on type
    const getBadgeColor = () => {
        switch (type) {
            case 'Stage':
                return 'bg-yellow-600';
            case 'PFE':
                return 'bg-yellow-600';
            case 'Emploi':
                return 'bg-yellow-600';
            default:
                return 'bg-yellow-600';
        }
    };

    return (
        <div className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 hover:scale-105 transition-all duration-300 flex flex-col h-full">
            {/* Job Title */}
            <h3 className="text-xl font-bold text-white mb-3">
                {title}
            </h3>

            {/* Company and Location */}
            <p className="text-gray-400 text-sm mb-4">
                {company} - {location}
            </p>

            {/* Type Badge */}
            <div className="mb-4">
                <span className={`${getBadgeColor()} text-white text-xs px-3 py-1 rounded-full`}>
                    {type}
                </span>
            </div>

            {/* View Button - Pushed to bottom */}
            <Link
                to={`/offre/${title.toLowerCase().replace(/\s+/g, '-')}`}
                className="block w-full bg-yellow-400 text-black text-center py-3 rounded-full font-semibold hover:bg-yellow-500 active:scale-95 transition-all duration-200 mt-auto"
            >
                Voir
            </Link>
        </div>
    );
}

export default OfferCard;
