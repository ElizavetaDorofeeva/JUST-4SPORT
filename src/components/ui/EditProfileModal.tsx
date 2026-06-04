import React, { useState, useEffect } from 'react';
import { UserProfile, Sport } from '../../types/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (data: { name?: string; nickname?: string; email?: string; favoriteSports?: string[] }) => void;
  loading: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    favoriteSports: [] as string[]
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        nickname: profile.nickname || '',
        email: profile.email || '',
        favoriteSports: profile.favoriteSports || []
      });
    }
  }, [profile, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const changes: { [key: string]: any } = {};
    
    if (formData.name.trim()) changes.name = formData.name;
    if (formData.nickname.trim()) changes.nickname = formData.nickname;
    if (formData.email.trim()) changes.email = formData.email;
    if (formData.favoriteSports.length > 0) changes.favoriteSports = formData.favoriteSports;
    
    if (Object.keys(changes).length === 0) {
        onClose();
        return;
    }
    
    onSave(changes);
  };

  const toggleSport = (sport: Sport) => {
    setFormData(prev => {
      const sports = prev.favoriteSports || [];
      if (sports.includes(sport)) {
        return { ...prev, favoriteSports: sports.filter(s => s !== sport) };
      } else {
        return { ...prev, favoriteSports: [...sports, sport] };
      }
    });
  };

  if (!isOpen) return null;

  const allSports = [
    { value: Sport.VOLLEYBALL, label: 'Волейбол' },
    { value: Sport.BASKETBALL, label: 'Баскетбол' },
    { value: Sport.SOCCER, label: 'Футбол' },
    { value: Sport.HOCKEY, label: 'Хоккей' },
    { value: Sport.ULTIMATE, label: 'Алтимат' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-fade-in">
        <h3 className="text-xl font-bold text-[#8B1E1E] mb-4">
          Редактировать профиль
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
              placeholder="Введите имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Никнейм
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
              placeholder="Введите никнейм"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
              placeholder="Введите email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Любимые виды спорта
            </label>
            <div className="grid grid-cols-2 gap-2">
              {allSports.map(sport => (
                <label key={sport.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.favoriteSports.includes(sport.value)}
                    onChange={() => toggleSport(sport.value)}
                    className="w-4 h-4 text-[#8B1E1E] border-gray-300 rounded focus:ring-[#8B1E1E]"
                  />
                  <span className="text-sm text-gray-700">{sport.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};