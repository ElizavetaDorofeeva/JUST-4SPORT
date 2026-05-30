import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/user';
import { EventCard } from '../components/ui/EventCard';
import { Event, Sport, UserProfile } from '../types/profile';

type TabType = 'participant' | 'author' | 'past';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('participant');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await userApi.getProfile(user.id);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const getSkillLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      START: 'Новичок',
      MEDIUM: 'Средний',
      HARD: 'Продвинутый'
    };
    return labels[level] || level;
  };

  const getSportLabel = (sport: string) => {
    const labels: { [key: string]: string } = {
      VOLLEYBALL: 'Волейбол',
      BASKETBALL: 'Баскетбол',
      FOOTBALL: 'Футбол',
      TENNIS: 'Теннис',
      HOCKEY: 'Хоккей',
      ULTIMATE: 'Альтимат'
    };
    return labels[sport] || sport;
  };

  const handleCancelEvent = async (eventId: string) => {
    console.log('Cancel event:', eventId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E1E]"></div>
      </div>
    );
  }

  const getCurrentEvents = () => {
    if (!profile) return [];
    
    switch (activeTab) {
      case 'participant':
        return profile.participantEvents.filter(
          e => e.eventStatus !== 'FINISHED'
        );
      case 'author':
        return profile.authorEvents.filter(
          e => e.eventStatus !== 'FINISHED'
        );
      case 'past':
        return [
          ...profile.participantEvents,
          ...profile.authorEvents
        ].filter(e => e.eventStatus === 'FINISHED');
      default:
        return [];
    }
  };

  const currentEvents = getCurrentEvents();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
                {profile?.photo?.path ? (
                  <img 
                    src={profile.photo.path} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">фото</span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.name || user?.name || 'Пользователь'}
              </h1>
              <p className="text-gray-500 mb-2">@{profile?.nickname || 'user'}</p>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Редактировать профиль
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-[#8B1E1E] uppercase mb-2">
                Любимый спорт
              </h3>
              <p className="text-gray-900 font-medium">
                {profile?.favoriteSports && profile.favoriteSports.length > 0
                  ? profile.favoriteSports.map(sport => getSportLabel(sport)).join(', ')
                  : 'Не указано'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-[#8B1E1E] uppercase mb-2">
                Уровень
              </h3>
              <p className="text-gray-900 font-medium">
                {getSkillLevelLabel('START')}
              </p>
            </div>
          </div>

          <div className="border-b border-gray-300 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('participant')}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === 'participant'
                    ? 'text-[#8B1E1E]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Участвую
                {activeTab === 'participant' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('author')}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === 'author'
                    ? 'text-[#8B1E1E]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Организую
                {activeTab === 'author' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === 'past'
                    ? 'text-[#8B1E1E]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Прошедшие
                {activeTab === 'past' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {currentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {activeTab === 'participant' && 'Вы пока не участвуете в событиях'}
                {activeTab === 'author' && 'Вы пока не организовали события'}
                {activeTab === 'past' && 'У вас нет прошедших событий'}
              </p>
            ) : (
              currentEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  showCancelButton={activeTab !== 'past'}
                  onCancel={() => handleCancelEvent(event.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};