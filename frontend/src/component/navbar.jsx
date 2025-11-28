import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Mock user data - replace with actual user data from your auth context
  const user = {
    name: 'John Doe',
    image: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Logo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-600"
                  />
                  <span className="font-medium text-gray-700">{user.name}</span>
                  <FaChevronDown
                    className={`text-gray-600 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none text-2xl"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {!isLoggedIn ? (
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/signin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center space-x-3 px-4 py-2">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-blue-600"
                />
                <span className="font-medium text-gray-700">{user.name}</span>
              </div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Settings
              </Link>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
