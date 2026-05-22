import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Вспомогательная функция для активного класса (чтобы "Главная" была красной, как на макете)
  const isActive = (path: string) => location.pathname === path;

  return (
    // fixed top-0 w-full z-50 - делает хедер фиксированным сверху
    // border-b border-gray-300 - нижняя линия как на макете
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-300 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Логотип */}
        <Link to="/" className="text-2xl font-bold text-[#8B1E1E] no-underline">
          JUST 4SPORT
        </Link>

        {/* Навигация */}
        <nav className="flex items-center space-x-8">
          <Link
            to="/"
            className={`font-medium text-base transition-colors ${
              isActive('/') ? 'text-[#8B1E1E]' : 'text-gray-700 hover:text-[#8B1E1E]'
            }`}
          >
            Главная
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className={`font-medium text-base transition-colors ${
                  isActive('/create') ? 'text-[#8B1E1E]' : 'text-gray-700 hover:text-[#8B1E1E]'
                }`}
              >
                Создать
              </Link>
              <Link
                to="/profile"
                className={`font-medium text-base transition-colors ${
                  isActive('/profile') ? 'text-[#8B1E1E]' : 'text-gray-700 hover:text-[#8B1E1E]'
                }`}
              >
                Профиль
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-[#8B1E1E] font-medium text-base transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 hover:text-[#8B1E1E] font-medium text-base transition-colors"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};