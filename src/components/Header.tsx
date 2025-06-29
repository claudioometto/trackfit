import React, { useState, useEffect } from 'react';
import { Dumbbell, Menu, X, Sun, Moon, LogOut, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { syncData, loading } = useWorkout();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  const handleSync = async () => {
    await syncData();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.email?.split('@')[0] || user.email || 'Usuário';
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors">
          <Dumbbell size={24} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold">TrackFit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Início
          </Link>
          <Link 
            to="/treinos" 
            className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              location.pathname.includes('/treinos') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Treinos
          </Link>
          <Link 
            to="/exercicios" 
            className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              location.pathname.includes('/exercicios') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Exercícios
          </Link>
          <Link 
            to="/progresso" 
            className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              location.pathname.includes('/progresso') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Progresso
          </Link>

          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={handleSync}
              disabled={loading}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              aria-label="Sync data"
              title="Sincronizar dados"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {getUserDisplayName()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Sign out"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={toggleMenu} 
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg absolute w-full transition-all duration-300 ease-in-out border-t dark:border-gray-700">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              to="/" 
              onClick={closeMenu}
              className={`py-2 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Início
            </Link>
            <Link 
              to="/treinos" 
              onClick={closeMenu}
              className={`py-2 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                location.pathname.includes('/treinos') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Treinos
            </Link>
            <Link 
              to="/exercicios" 
              onClick={closeMenu}
              className={`py-2 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                location.pathname.includes('/exercicios') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Exercícios
            </Link>
            <Link 
              to="/progresso" 
              onClick={closeMenu}
              className={`py-2 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                location.pathname.includes('/progresso') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Progresso
            </Link>

            <div className="border-t dark:border-gray-700 pt-4 mt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleSync}
                    disabled={loading}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    aria-label="Sync data"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 py-2 font-medium"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;