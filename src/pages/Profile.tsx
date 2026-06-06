import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/user';
import { EventCard } from '../components/ui/EventCard';
import { Event, Sport, UserProfile } from '../types/profile';
import { EditProfileModal } from '../components/ui/EditProfileModal';
import { PhotoManagementModal } from '../components/ui/PhotoManagementModal';

type TabType = 'participant' | 'author' | 'past';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('participant');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

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

  const handleCancelEvent = async (eventId: string) => {
  };

  const handlePhotoClick = () => {
    setShowPhotoModal(true);
  };

  const handleUploadPhoto = async (url: string) => {
    if (!user?.id || !url.trim()) return;
    
    const title = 'Фото профиля';

    try {
      await userApi.updatePhoto(user.id, { path: url, title });
      const data = await userApi.getProfile(user.id);
      setProfile(data);
      setShowPhotoModal(false);
    } catch (error) {
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id) return;

    try {
      await userApi.deletePhoto(user.id);
      const data = await userApi.getProfile(user.id);
      setProfile(data);
      setShowPhotoModal(false);
    } catch (error) {
    }
  };

  const handleSaveProfile = async (data: { 
    name?: string; nickname?: string; email?: string; favoriteSports?: string[] 
  }) => {
    const userId = user?.id;
    if (!userId) return;

    setSavingProfile(true);
    try {
      const fullData = {
        name: data.name || profile?.name || '',
        nickname: data.nickname || profile?.nickname || '',
        email: data.email || profile?.email || '',
        favoriteSports: data.favoriteSports || profile?.favoriteSports || []
      };
      
      await userApi.updateProfile(userId, fullData);
      const updated = await userApi.getProfile(userId);
      setProfile(updated);
      setShowEditModal(false);
    } catch (err: any) {
    } finally {
      setSavingProfile(false);
    }
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

  useEffect(() => {
    document.body.classList.add('no-scroll');
  
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 overflow-y-auto">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          
          <div className="flex items-start gap-6 mb-6">
            
            <div 
              onClick={handlePhotoClick} 
              className="flex-shrink-0 cursor-pointer"
              title="Нажмите, чтобы обновить фото"
            >
              <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-gray-100">
                {profile?.photo?.path ? (
                  <img 
                    src={profile.photo.path} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center">Загрузить<br/>фото</span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.name || user?.name || 'Пользователь'}
              </h1>
              <p className="text-gray-500 mb-4">@{profile?.nickname || 'user'}</p>
              
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
              >
                Редактировать профиль
              </button>
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
              {(['participant', 'author', 'past'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium transition-colors relative ${
                    activeTab === tab ? 'text-[#8B1E1E]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'participant' ? 'Участвую' : tab === 'author' ? 'Организую' : 'Прошедшие'}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {currentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p>
                  {activeTab === 'participant' && 'Вы пока не участвуете в событиях'}
                  {activeTab === 'author' && 'Вы пока не организовали события'}
                  {activeTab === 'past' && 'У вас нет прошедших событий'}
                </p>
              </div>
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

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
        loading={savingProfile}
      />
      <PhotoManagementModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        hasPhoto={!!profile?.photo?.path}
        currentPhotoUrl={profile?.photo?.path || ''}
        onUpload={handleUploadPhoto}
        onDelete={handleDeletePhoto}
      />
    </div>
  );
};