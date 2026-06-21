import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Participant, eventApi } from '../../api/event';
import { ConfirmModal } from './ConfirmModal';

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Participant | null;
  eventId?: string;
  isAuthor?: boolean;
  onTeamDeleted?: () => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  isOpen,
  onClose,
  team,
  eventId,
  isAuthor = false,
  onTeamDeleted
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !team) return null;

  const handleUserClick = (userId: string) => {
    onClose();
    
    if (user?.id === userId) {
      navigate('/profile');
    } else {
      navigate(`/users/${userId}`);
    }
  };

  // ✅ Открываем модалку подтверждения
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // ✅ Реальное удаление после подтверждения
  const handleConfirmDelete = async () => {
    if (!eventId || !team.id) return;

    setIsDeleting(true);
    try {
      await eventApi.deleteTeam(eventId, team.id);
      setShowDeleteConfirm(false);
      onClose();
      if (onTeamDeleted) {
        onTeamDeleted();
      }
    } catch (error) {
      console.error('❌ Ошибка при удалении команды:', error);
      alert('❌ Не удалось удалить команду');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#8B1E1E]">
              {team.name}
            </h3>
            {isAuthor && (
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Удалить команду"
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Капитан
            </p>
            <div 
              onClick={() => handleUserClick(team.captain.id)}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-[#8B1E1E]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] flex items-center justify-center font-bold flex-shrink-0">
                  {team.captain.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {team.captain.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  @{team.captain.nickname}
                </p>
              </div>
              <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-[#8B1E1E] transition-colors flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {isAuthor && team.contactInformation && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Контактная информация
              </p>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-900 break-words">
                  {team.contactInformation}
                </p>
              </div>
            </div>
          )}

          {team.teamMembers && team.teamMembers.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Участники ({team.teamMembers.length})
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {team.teamMembers.map(member => (
                  <div 
                    key={member.id}
                    onClick={() => handleUserClick(member.id)}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-[#8B1E1E]/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] flex items-center justify-center font-bold flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        @{member.nickname}
                      </p>
                    </div>
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover:text-[#8B1E1E] transition-colors flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!team.teamMembers || team.teamMembers.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">
              В команде только капитан
            </p>
          )}
          
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удаление команды"
        message={`Вы действительно хотите удалить команду "${team.name}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};