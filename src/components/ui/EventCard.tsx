import React, { useState, useEffect } from 'react';
import { tokenStorage } from '../../utils/tokenStorage';
import { Event } from '../../api/event';

interface EventCardProps {
  event: Event;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showCancelButton = false,
  onCancel
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPhoto = async () => {
      if (!event.photo?.path) {
        setPhotoUrl(null);
        return;
      }

      try {
        const token = tokenStorage.getAccessToken();
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/photo/${event.photo.path}`,
          { headers }
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
    if (!dateString) return 'Дата не указана';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Некорректная дата';
    }
    
    const day = date.getDate();
    const month = date.toLocaleString('ru-RU', { month: 'long' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      TRAINING: 'Тренировка',
      GAME: 'Игра',
      TOURNAMENT: 'Турнир'
    };
    return labels[type] || type;
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 text-center">ФОТО</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {event.name || getEventTypeLabel(event.eventType)}
        </h3>
        <p className="text-sm text-gray-600">
          {formatDate(event.dateStart)}
        </p>
        {(event as any).place && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            📍 {(event as any).place}
          </p>
        )}
      </div>

      {showCancelButton && onCancel && (
        <div className="flex items-center">
          <button
            onClick={handleCancelClick}
            className="text-[#8B1E1E] hover:text-[#6B1616] text-sm font-medium transition-colors"
          >
            Отозвать
          </button>
        </div>
      )}
    </div>
  );
};