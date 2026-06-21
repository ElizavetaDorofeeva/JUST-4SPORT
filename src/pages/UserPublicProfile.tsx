import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { EventCard } from '../components/ui/EventCard';
import { UserProfile } from '../types/profile';
import { tokenStorage } from '../utils/tokenStorage';
import { Event } from '../api/event';

type TabType = 'participant' | 'author';

export const UserPublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('participant');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  useEffect(() => {
    const loadPhoto = async () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
        setPhotoUrl(null);
      }

      if (!profile?.photo?.path) return;

      try {
        const token = tokenStorage.getAccessToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/photo/${profile.photo.path}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPhotoUrl(url);
        }
      } catch (error) {
        console.error('❌ Не удалось загрузить фото:', error);
      }
    };

    loadPhoto();
  }, [profile?.photo?.path]);

  const loadProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await userApi.getUserProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSportLabel = (sport: string) => {
    const labels: { [key: string]: string } = {
      VOLLEYBALL: 'волейбол',
      BASKETBALL: 'баскетбол',
      SOCCER: 'футбол',
      HOCKEY: 'хоккей',
      ULTIMATE: 'алтимат'
    };
    return labels[sport] || sport;
  };

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
      default:
        return [];
    }
  };

  const currentEvents = getCurrentEvents();

  useEffect(() => {
    document.body.classList.add('no-scroll');
  
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 overflow-y-auto">
        
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-[#8B1E1E] hover:text-[#6B1616] transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-gray-100">
                {photoUrl ? (
                  <img 
                    src={photoUrl}
                    alt={profile?.name || 'Фото'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center">Нет<br/>фото</span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.name || 'Пользователь'}
              </h1>
              <p className="text-gray-500 mb-4">@{profile?.nickname || 'user'}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-[#8B1E1E] uppercase mb-3">
                Любимый спорт
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.favoriteSports && profile.favoriteSports.length > 0 ? (
                  profile.favoriteSports.map((sport, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium"
                    >
                      {getSportLabel(sport)}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Не указано</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-300 mb-4">
            <div className="flex gap-6">
              {(['participant', 'author'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium transition-colors relative ${
                    activeTab === tab ? 'text-[#8B1E1E]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'participant' ? 'Участвует' : 'Организует'}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {currentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p>
                  {activeTab === 'participant' && 'Пользователь пока не участвует в событиях'}
                  {activeTab === 'author' && 'Пользователь пока не организовал события'}
                </p>
              </div>
            ) : (
              currentEvents.map(event => (
                <div 
                  key={event.id} 
                  onClick={() => handleEventClick(event.id)}
                  className="cursor-pointer"
                >
                  <EventCard
                    event={event as unknown as Event}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};