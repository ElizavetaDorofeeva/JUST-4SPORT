import React from 'react';
import { Participant } from '../../api/event';

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Participant | null;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  isOpen,
  onClose,
  team
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-[#8B1E1E] mb-4">
          {team.name}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Капитан
          </p>
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
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
          </div>
        </div>

        {team.teamMembers && team.teamMembers.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Участники ({team.teamMembers.length})
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {team.teamMembers.map(member => (
                <div 
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl"
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
  );
};