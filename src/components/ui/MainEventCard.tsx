import React, { useState, useEffect } from 'react';
import { Event } from '../../api/event';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../../utils/tokenStorage';

interface MainEventCardProps {
  event: Event;
}

export const MainEventCard: React.FC<MainEventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPhoto = async () => {
      if (!event.photo?.path) {
        setPhotoUrl(null);
        return;
      }

      try {
        const token = tokenStorage.getAccessToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/photo/${event.photo.path}`,
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

    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [event.photo?.path]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  const getSkillLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      START: 'новички',
      MEDIUM: 'средний',
      HARD: 'продвинутый'
    };
    return labels[level] || level;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      TRAINING: 'Тренировка',
      GAME: 'Игра',
      TOURNAMENT: 'Турнир'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-lg">Фото</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
        {event.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-1">
          {formatDate(event.dateStart)}
        </p>
        
        <p className="text-sm text-gray-600 mb-1">
          {getSportLabel(event.sport)}
        </p>
        
        <p className="text-sm text-gray-600 mb-3">
          {getSkillLevelLabel(event.skillLevel)}
        </p>

        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="w-full py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors font-medium"
        >
          Подать заявку
        </button>
      </div>
    </div>
  );
};