import React from 'react';

interface EventStatusPanelProps {
  userRole: 'NONE' | 'CAPTAIN' | 'MEMBER';
  isAuthor: boolean;
  eventStatus: string;
  onApply: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const EventStatusPanel: React.FC<EventStatusPanelProps> = ({
  userRole,
  isAuthor,
  eventStatus,
  onApply,
  onCancel,
  onEdit,
  onDelete
}) => {
  if (eventStatus !== 'WILL_BE') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-2xl">
              {eventStatus === 'UNDERWAY'}
              {eventStatus === 'FINISHED'}
              {eventStatus === 'CANCELLED'}
            </span>
            <p className="text-gray-700 font-medium">
              {eventStatus === 'UNDERWAY' && 'Мероприятие в процессе'}
              {eventStatus === 'FINISHED' && 'Мероприятие завершено'}
              {eventStatus === 'CANCELLED' && 'Мероприятие отменено'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      
      {isAuthor && (
        <div className="space-y-3">
          <button
            onClick={onEdit}
            className="w-full py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors font-medium text-lg flex items-center justify-center gap-2"
          >
            Редактировать мероприятие
          </button>
          <button
            onClick={onDelete}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-lg flex items-center justify-center gap-2"
          >
            Удалить мероприятие
          </button>
        </div>
      )}

      {!isAuthor && userRole === 'CAPTAIN' && (
        <div className="space-y-3">
          <button
            onClick={onCancel}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-lg flex items-center justify-center gap-2"
          >
            Отозвать заявку
          </button>
        </div>
      )}

      {!isAuthor && userRole === 'MEMBER' && (
        <div className="space-y-3">
          <button
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium text-lg flex items-center justify-center gap-2"
          >
            Вы зарегестрированы
          </button>
        </div>
      )}

      {!isAuthor && userRole === 'NONE' && (
        <button
          onClick={onApply}
          className="w-full py-4 bg-gradient-to-r from-[#8B1E1E] to-[#6B1616] text-white rounded-xl hover:from-[#6B1616] hover:to-[#5A1212] transition-all font-medium text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Подать заявку на участие
        </button>
      )}
    </div>
  );
};