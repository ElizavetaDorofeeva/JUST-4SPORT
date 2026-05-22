import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/ui/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

// ... (ProtectedRoute тот же) ...
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Страницы-заглушки
const HomePage = () => <div className="p-6"><h2 className="text-2xl font-bold">Главная страница</h2></div>;
const CreatePage = () => <div className="p-6"><h2 className="text-2xl font-bold">Создать событие</h2></div>;
const ProfilePage = () => <div className="p-6"><h2 className="text-2xl font-bold">Профиль</h2></div>;

const AppContent: React.FC = () => {
  return (
    <>
      {/* Хедер теперь фиксированный */}
      <Header />
      
      {/* pt-16 (padding-top: 4rem) нужен, чтобы контент не прятался под хедером */}
      <main className="pt-16 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;