import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LaunchScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-5xl font-bold text-[#8B1E1E]">JUST 4SPORT</h1>
    </div>
  );
};