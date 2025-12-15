function StatCard({ label, value, icon }) {
    return (
        <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 flex flex-col">
            <span className="text-gray-400 text-sm mb-2">{label}</span>
            <span className="text-4xl font-bold text-white">{value}</span>
        </div>
    );
}

export default StatCard;
