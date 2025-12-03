import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="bg-black text-white py-4 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between border-2 border-yellow-400/30 bg-yellow-400/10 rounded-2xl px-6 py-3">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                    <span className="text-yellow-400">📊</span>
                    <span>DZ-Stagiaire</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/offres" className="relative text-gray-300 hover:text-white transition group">
                        Offres
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link to="/entreprises" className="relative text-gray-300 hover:text-white transition group">
                        Pour les entreprises
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link to="/blog" className="relative text-gray-300 hover:text-white transition group">
                        Blog
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>

                {/* CTA Button */}
                <Link
                    to="/signin"
                    className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition"
                >
                    Se Connecter
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
