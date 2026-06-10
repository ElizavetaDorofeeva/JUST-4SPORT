import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-[#8B1E1E] mb-8">JUST 4SPORT</h1>
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-lg mb-4">Мероприятие создано!</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};