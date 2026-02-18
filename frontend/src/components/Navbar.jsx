import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg hidden sm:block">G.O.T Transportation</span>
              <span className="text-white font-bold text-lg sm:hidden">G.O.T</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/book" className="text-blue-300 hover:text-white transition text-sm font-medium">
                  Book Ride
                </Link>
                <Link to="/my-bookings" className="text-blue-300 hover:text-white transition text-sm font-medium">
                  My Rides
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 transition text-sm font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 ml-4 border-l border-slate-700 pl-4">
                  <span className="text-slate-400 text-sm hidden sm:block">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-blue-300 hover:text-white transition text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
