import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/messageService';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, isStudent, isCompany, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Fetch notifications
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchNotifications = async () => {
            try {
                const data = await notificationService.getNotifications();
                if (data && data.results) {
                    setNotifications(data.results);
                    const unread = data.results.filter(n => !n.is_read).length;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
        // Optional: Polling
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    // Déterminer le type d'utilisateur
    const getUserType = () => {
        if (!isAuthenticated) return 'guest';
        if (isStudent()) return 'student';
        if (isCompany()) return 'enterprise';
        return 'guest';
    };

    const userType = getUserType();

    const navLinks = {
        guest: [
            { name: 'Accueil', path: '/' },
            { name: 'Offres de stage', path: '/offres' },
            { name: 'Contact', path: '/contact' }
        ],
        student: [
            { name: 'Offres', path: '/offres' },
            { name: 'Tableau de bord', path: '/dashboard-etudiant' }
        ],
        enterprise: []
    };

    return (
        <nav className="bg-black text-white border-b border-[#3A362D] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg">
                            <span className="text-black font-bold text-xs">DZ</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight hidden sm:block">DZ-Stagiaire</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks[userType].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'text-[#F9B134]'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {userType === 'guest' ? (
                            <>
                                <Link
                                    to="/entreprises"
                                    className="hidden md:block text-sm font-medium text-[#F9B134] hover:text-[#e5a02a] transition-colors"
                                >
                                    Pour les entreprises
                                </Link>
                                <Link
                                    to="/signin"
                                    className="px-4 py-2 rounded-full bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                                >
                                    Connexion
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative text-gray-400 hover:text-white transition-colors focus:outline-none"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white"></span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-[#26231D] border border-[#3A362D] rounded-xl shadow-xl overflow-hidden z-50">
                                            <div className="p-3 border-b border-[#3A362D] flex justify-between items-center bg-[#1E1C16]">
                                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllRead} className="text-xs text-[#F9B134] hover:underline">
                                                        Tout marquer comme lu
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500 text-xs">
                                                        Aucune notification pour le moment.
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={`p-3 border-b border-[#3A362D] last:border-0 hover:bg-[#3A362D]/50 transition-colors ${!notif.is_read ? 'bg-[#3A362D]/20' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="mt-1 flex-shrink-0">
                                                                    <div className={`w-2 h-2 rounded-full ${!notif.is_read ? 'bg-[#F9B134]' : 'bg-transparent'}`}></div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-300 leading-snug">{notif.message || notif.verb || "Nouvelle notification"}</p>
                                                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(notif.timestamp || notif.created_at).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown Trigger */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 focus:outline-none">
                                        <div className="w-8 h-8 rounded-full bg-[#3A362D] border border-[#4A463D] flex items-center justify-center overflow-hidden">
                                            {userType === 'student' ? (
                                                user?.avatar_url ? (
                                                    <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[#F9B134] font-bold text-xs">
                                                        {user?.full_name?.substring(0, 2).toUpperCase() || 'ET'}
                                                    </span>
                                                )
                                            ) : (
                                                user?.logo_url ? (
                                                    <img src={user.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[#F9B134] font-bold text-xs">
                                                        {user?.company_name?.substring(0, 2).toUpperCase() || 'EN'}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <span className="hidden md:block text-sm font-medium text-gray-300">
                                            {user?.full_name || (userType === 'student' ? 'Étudiant' : 'Entreprise')}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-[#26231D] border border-[#3A362D] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                        <div className="py-1">
                                            <div className="px-4 py-2 border-b border-[#3A362D]">
                                                <p className="text-sm font-bold text-white">
                                                    {user?.full_name || (userType === 'student' ? 'Étudiant' : 'Entreprise')}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email || 'user@example.com'}
                                                </p>
                                            </div>
                                            <Link
                                                to={userType === 'student' ? '/profile-etudiant' : '/profil-entreprise'}
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3A362D] hover:text-white"
                                            >
                                                Mon Profil
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3A362D] hover:text-white"
                                            >
                                                Paramètres
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#3A362D] hover:text-red-300"
                                            >
                                                Déconnexion
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#26231D] border-t border-[#3A362D]">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks[userType].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path
                                    ? 'bg-[#3A362D] text-[#F9B134]'
                                    : 'text-gray-300 hover:bg-[#3A362D] hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {userType === 'guest' && (
                            <Link
                                to="/signin"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-[#F9B134] hover:bg-[#3A362D]"
                            >
                                Connexion
                            </Link>
                        )}
                        {userType !== 'guest' && (
                            <>
                                <Link
                                    to={userType === 'student' ? '/profile-etudiant' : '/profil-entreprise'}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#3A362D] hover:text-white"
                                >
                                    Mon Profil
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-[#3A362D] hover:text-red-300"
                                >
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
