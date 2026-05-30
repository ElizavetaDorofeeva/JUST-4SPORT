import React from 'react';
import { Event } from '../../types/profile';

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow">
      {/* Фото события */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
          {event.photo?.path ? (
            <img 
              src={event.photo.path} 
              alt={event.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-xs text-gray-500 text-center">ФОТО</span>
          )}
        </div>
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1">
          {getEventTypeLabel(event.eventType)}
        </h3>
        <p className="text-sm text-gray-600">
          {formatDate(event.date)}
        </p>
        {event.place && (
          <p className="text-sm text-gray-500 mt-1">
            📍 {event.place}
          </p>
        )}
      </div>

      {/* Кнопка отмены */}
      {showCancelButton && onCancel && (
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="text-[#8B1E1E] hover:text-[#6B1616] text-sm font-medium transition-colors"
          >
            Отозвать
          </button>
        </div>
      )}
    </div>
  );
};