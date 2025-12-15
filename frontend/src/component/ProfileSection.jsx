function ProfileSection({ title, children, onEdit }) {
    return (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-[#F9B134] hover:text-[#e5a02a] transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                        aria-label={`Modifier ${title}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

export default ProfileSection;
