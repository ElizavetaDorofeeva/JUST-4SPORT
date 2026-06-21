import React, { useState } from 'react';
import { EventDetail } from '../../api/event';

interface ScheduleManagerProps {
  event: EventDetail;
  onUpdateSchedule: (games: Array<{
    id?: string;
    date: string;
    firstParticipantId: string;
    secondParticipantId: string;
  }>) => Promise<void>;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  event,
  onUpdateSchedule
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newGame, setNewGame] = useState({
    date: '',
    firstParticipantId: '',
    secondParticipantId: ''
  });

    const handleAddGame = () => {
        if (!newGame.date || !newGame.firstParticipantId || !newGame.secondParticipantId) {
            alert('Заполните все поля');
            return;
        }

        if (newGame.firstParticipantId === newGame.secondParticipantId) {
            alert('Команды должны быть разными');
            return;
        }

        const existingGames = (event.schedule?.games || []).map(g => ({
            id: g.id,
            date: g.date,
            firstParticipantId: g.firstParticipant.id,
            secondParticipantId: g.secondParticipant.id
        }));

        const updatedGames = [
            ...existingGames,
            {
            date: new Date(newGame.date).toISOString(),
            firstParticipantId: newGame.firstParticipantId,
            secondParticipantId: newGame.secondParticipantId
            }
        ];

        onUpdateSchedule(updatedGames);
        setNewGame({ date: '', firstParticipantId: '', secondParticipantId: '' });
        setIsEditing(false);
    };

  const handleDeleteGame = (gameId: string) => {
    if (!window.confirm('Удалить эту игру?')) return;

    const updatedGames = event.schedule?.games
      .filter(g => g.id !== gameId)
      .map(g => ({
        id: g.id,
        date: g.date,
        firstParticipantId: g.firstParticipant.id,
        secondParticipantId: g.secondParticipant.id
      })) || [];

    onUpdateSchedule(updatedGames);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Управление расписанием
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors text-sm font-medium"
        >
          {isEditing ? 'Отмена' : '+ Добавить игру'}
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Новая игра</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата и время
              </label>
              <input
                type="datetime-local"
                value={newGame.date}
                onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Первая команда
              </label>
              <select
                value={newGame.firstParticipantId}
                onChange={(e) => setNewGame({ ...newGame, firstParticipantId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              >
                <option value="">Выберите команду</option>
                {event.teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вторая команда
              </label>
              <select
                value={newGame.secondParticipantId}
                onChange={(e) => setNewGame({ ...newGame, secondParticipantId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              >
                <option value="">Выберите команду</option>
                {event.teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddGame}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Добавить
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {event.schedule?.games && event.schedule.games.length > 0 ? (
          event.schedule.games.map(game => (
            <div 
              key={game.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-sm text-gray-600 min-w-[150px]">
                  {new Date(game.date).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <span className="font-medium text-gray-900">{game.firstParticipant.name}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium text-gray-900">{game.secondParticipant.name}</span>
                </div>
                {game.result && game.result !== 'string' && (
                  <span className="px-2 py-1 bg-[#8B1E1E] text-white rounded text-sm font-bold">
                    {game.result}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteGame(game.id)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Удалить игру"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            Расписание ещё не составлено
          </p>
        )}
      </div>
    </div>
  );
};