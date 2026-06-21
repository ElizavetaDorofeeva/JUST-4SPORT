import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/user';
import { EventCard } from '../components/ui/EventCard';
import { UserProfile } from '../types/profile';
import { EditProfileModal } from '../components/ui/EditProfileModal';
import { PhotoManagementModal } from '../components/ui/PhotoManagementModal';
import { tokenStorage } from '../utils/tokenStorage';
import { useNavigate } from 'react-router-dom';
import { Event } from '../api/event';
import { ConfirmModal } from '../components/ui/ConfirmModal';

type TabType = 'participant' | 'author';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('participant');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        } else {
          console.error('❌ Ошибка загрузки фото:', response.status);
        }
      } catch (error) {
        console.error('❌ Не удалось загрузить фото:', error);
      }
    };

    loadPhoto();
  }, [profile?.photo?.path]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await userApi.getProfile();
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

  const handleUploadPhoto = async (file: File) => {
    if (!user?.id) return;

    try {
      await userApi.updatePhoto(file);
      const data = await userApi.getProfile();
      setProfile(data);
      setShowPhotoModal(false);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки фото:', error);
      alert('❌ Ошибка при загрузке фото');
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id) return;

    try {
      await userApi.deletePhoto();
      const data = await userApi.getProfile();
      setProfile(data);
      setShowPhotoModal(false);
    } catch (error) {
    }
  };

  const handleSaveProfile = async (data: { 
    name?: string; nickname?: string; email?: string; favoriteSports?: string[] 
  }) => {
    setSavingProfile(true);
    try {
      const fullData = {
        name: data.name || profile?.name || '',
        nickname: data.nickname || profile?.nickname || '',
        email: data.email || profile?.email || '',
        favoriteSports: data.favoriteSports || profile?.favoriteSports || []
      };
      
      await userApi.updateProfile(fullData);
      const updated = await userApi.getProfile();
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

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      await userApi.deleteProfile();
      tokenStorage.clear();
      setShowDeleteConfirm(false);
      navigate('/login');
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

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
                {photoUrl ? (
                  <img 
                    src={photoUrl}
                    alt={profile?.name || 'Фото'}
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
            
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
              >
                Редактировать профиль
              </button>
              
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
              >
                Удалить аккаунт
              </button>
            </div>
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
                  {tab === 'participant' ? 'Участвую' : 'Организую'}
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
                    showCancelButton={true}
                    onCancel={() => handleCancelEvent(event.id)}
                  />
                </div>
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
        onUpload={handleUploadPhoto}
        onDelete={handleDeletePhoto}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удаление аккаунта"
        message="Вы уверены, что хотите удалить аккаунт? Все ваши данные будут удалены."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteProfile}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};