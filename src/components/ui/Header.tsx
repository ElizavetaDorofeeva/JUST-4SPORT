import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../ui/ConfirmModal';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-300 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          <Link to="/" className="text-2xl font-bold text-[#8B1E1E] no-underline">
            JUST 4SPORT
          </Link>

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

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти из системы?"
        confirmText="Выйти"
        cancelText="Отмена"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};