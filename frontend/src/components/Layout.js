import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentEnabled, setPaymentEnabled] = React.useState(true);

  React.useEffect(() => {
    import('../services/api').then(({ paymentAPI }) => {
      paymentAPI.getConfig().then(response => {
        setPaymentEnabled(response.data.enabled);
      }).catch(() => {
        setPaymentEnabled(false);
      });
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600" aria-label="MusicGen Home">
                MusicGen
              </Link>
              <div className="ml-10 flex space-x-4">
                {user && (
                  <Link
                    to="/songs"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/songs') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-current={isActive('/songs') ? 'page' : undefined}
                  >
                    My Songs
                  </Link>
                )}
                <Link
                  to="/create"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/create') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive('/create') ? 'page' : undefined}
                >
                  Create Song
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {!user.is_paid && paymentEnabled && (
                    <Link
                      to="/payment"
                      className="btn-primary"
                      aria-label="Upgrade to premium"
                    >
                      Upgrade
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    aria-label="Account settings"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary"
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1" role="main">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 MusicGen. AI-powered music creation.</p>
          <p>Made with ❤️ by RON</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
