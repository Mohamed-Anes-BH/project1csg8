import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="bg-[#1a1a1a] text-white border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
                        <span className="text-black font-bold text-xs">DZ</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">DZ-Stagiaire</span>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <Link to="/offres" className="hover:text-white transition-colors">Offres de stage</Link>
                    <Link to="/entreprises" className="hover:text-white transition-colors">Entreprises</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/entreprises"
                        className="hidden md:block px-5 py-2 rounded-full border border-[#F9B134] text-[#F9B134] text-sm font-medium hover:bg-[#F9B134]/10 transition-colors"
                    >
                        Pour Entreprise
                    </Link>
                    <Link
                        to="/signin"
                        className="px-5 py-2 rounded-full bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                    >
                        Connexion
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
