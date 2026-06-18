import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/user';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (application: {
    name: string;
    captainNickname: string;
    membersNicknames: string[];
    contactInformation: string;
  }) => Promise<void>;
  loading?: boolean;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [captainNickname, setCaptainNickname] = useState('');
  const [membersText, setMembersText] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const profile = await userApi.getProfile();
          setUserProfile(profile);
          setCaptainNickname(profile.nickname || '');
          setContactInfo(profile.email || '');
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
    };

    if (isOpen) {
      loadProfile();
    }
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const membersNicknames = membersText
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    await onSubmit({
      name: teamName,
      captainNickname,
      membersNicknames,
      contactInformation: contactInfo
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold text-[#8B1E1E] mb-6">
          Подать заявку на участие
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название команды *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              placeholder="Например: Dragons"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Никнейм капитана *
            </label>
            <input
              type="text"
              value={captainNickname}
              onChange={(e) => setCaptainNickname(e.target.value)}
              required
              placeholder="@username"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Никнеймы участников
            </label>
            <textarea
              value={membersText}
              onChange={(e) => setMembersText(e.target.value)}
              rows={3}
              placeholder="user1, user2, user3 (через запятую)"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Перечислите никнеймы через запятую (без @)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Контактная информация *
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              placeholder="Email или телефон"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};