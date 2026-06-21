import React from 'react';

interface EventStatusPanelProps {
  userRole: 'NONE' | 'CAPTAIN' | 'MEMBER';
  isAuthor: boolean;
  eventStatus: string;
  registrationClosed?: boolean;
  onApply: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFinish: () => void;
  onCancelEvent: () => void;
  isFinishing?: boolean;
  isCancelling?: boolean;
}

export const EventStatusPanel: React.FC<EventStatusPanelProps> = ({
  userRole,
  isAuthor,
  eventStatus,
  registrationClosed = false,
  onApply,
  onCancel,
  onEdit,
  onDelete,
  onFinish,
  onCancelEvent,
  isFinishing = false,
  isCancelling = false
}) => {
  const canApply = eventStatus === 'WILL_BE' && !registrationClosed;

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
          
          {(eventStatus === 'WILL_BE' || eventStatus === 'UNDERWAY') && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onFinish}
                disabled={isFinishing}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-lg flex items-center justify-center gap-2"
              >
                {isFinishing ? 'Завершение...' : 'Завершить'}
              </button>
              <button
                onClick={onCancelEvent}
                disabled={isCancelling}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-lg flex items-center justify-center gap-2"
              >
                {isCancelling ? 'Отмена...' : 'Отменить'}
              </button>
            </div>
          )}
          
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
        canApply ? (
          <button
            onClick={onApply}
            className="w-full py-4 bg-gradient-to-r from-[#8B1E1E] to-[#6B1616] text-white rounded-xl hover:from-[#6B1616] hover:to-[#5A1212] transition-all font-medium text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Подать заявку на участие
          </button>
        ) : (
          <div className="space-y-3">
          <button
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium text-lg flex items-center justify-center gap-2"
          >
            Регистрация закрыта
          </button>
        </div>
        )
      )}
    </div>
  );
};