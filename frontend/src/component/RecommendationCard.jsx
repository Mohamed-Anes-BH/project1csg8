function RecommendationCard({ title, company, location }) {
    return (
        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-1">{company}</p>
            <p className="text-gray-500 text-sm">{location}</p>
        </div>
    );
}

export default RecommendationCard;
