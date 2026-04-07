import { type ReactNode } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiPieChart, FiList } from 'react-icons/fi';

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { token, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

export const Layout = ({ children }: { children: ReactNode }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiPieChart },
    { name: 'Expenses', path: '/expenses', icon: FiList },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                SpendWise
              </Link>
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      location.pathname === item.path
                        ? 'bg-blue-500/10 text-blue-400 font-medium'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-slate-400 text-sm">Hi, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-sm font-medium border border-red-500/20"
              >
                <FiLogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <footer className="py-6 text-center text-slate-500 text-sm border-t border-white/5 bg-slate-950">
        &copy; {new Date().getFullYear()} SpendWise Expense Tracker
      </footer>
    </div>
  );
};
