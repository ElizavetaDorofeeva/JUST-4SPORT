import React, { useState } from 'react';
import { EventDetail } from '../../api/event';

interface TeamStats {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface TournamentTableProps {
  event: EventDetail;
  isAuthor: boolean;
  onUpdateResult?: (gameId: string, result: string) => Promise<void>;
}

export const TournamentTable: React.FC<TournamentTableProps> = ({
  event,
  isAuthor,
  onUpdateResult
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [newResult, setNewResult] = useState('');

  const findGame = (team1Id: string, team2Id: string) => {
    return event.schedule?.games.find(
      g => 
        (g.firstParticipant.id === team1Id && g.secondParticipant.id === team2Id) ||
        (g.firstParticipant.id === team2Id && g.secondParticipant.id === team1Id)
    );
  };

  const getGameResult = (team1Id: string, team2Id: string): string | null => {
    const game = findGame(team1Id, team2Id);
    if (!game || !game.result || game.result === 'string') return null;
    return game.result;
  };

  const calculateStandings = (): TeamStats[] => {
    const stats: { [key: string]: TeamStats } = {};

    event.teams.forEach(team => {
      stats[team.id] = {
        id: team.id,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      };
    });

    event.schedule?.games.forEach(game => {
      if (!game.result || game.result === 'string') return;
      const [g1, g2] = game.result.split(':').map(Number);
      if (isNaN(g1) || isNaN(g2)) return;

      const t1 = stats[game.firstParticipant.id];
      const t2 = stats[game.secondParticipant.id];
      if (!t1 || !t2) return;

      t1.played++;
      t2.played++;
      t1.goalsFor += g1;
      t1.goalsAgainst += g2;
      t2.goalsFor += g2;
      t2.goalsAgainst += g1;

      if (g1 > g2) { t1.won++; t1.points += 3; t2.lost++; }
      else if (g2 > g1) { t2.won++; t2.points += 3; t1.lost++; }
      else { t1.drawn++; t1.points += 1; t2.drawn++; t2.points += 1; }
    });

    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const dA = a.goalsFor - a.goalsAgainst;
      const dB = b.goalsFor - b.goalsAgainst;
      if (dB !== dA) return dB - dA;
      return b.goalsFor - a.goalsFor;
    });
  };

  const standings = calculateStandings();
  const teams = event.teams;

  if (!teams || teams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Турнирная таблица</h2>
        <p className="text-gray-500 text-center py-8">Команды ещё не зарегистрированы</p>
      </div>
    );
  }

  const handleSaveResult = async (gameId: string) => {
    if (onUpdateResult) {
      await onUpdateResult(gameId, newResult);
      setEditingCell(null);
      setNewResult('');
    }
  };

  const handleCellClick = (team1Id: string, team2Id: string) => {
    if (!isAuthor) return;
    const game = findGame(team1Id, team2Id);
    if (game) {
      setEditingCell(`${team1Id}-${team2Id}`);
      setNewResult(game.result === 'string' ? '' : game.result || '');
    }
  };

  const getPlace = (teamId: string): string => {
    const index = standings.findIndex(s => s.id === teamId);
    if (index === -1) return '-';
    const place = index + 1;
    if (place === 1) return 'I';
    if (place === 2) return 'II';
    if (place === 3) return 'III';
    return String(place);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Турнирная таблица</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-center font-semibold text-gray-700 w-10">
                №
              </th>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-700 min-w-[140px]">
                Команда
              </th>
              {teams.map((team, idx) => (
                <th 
                  key={team.id} 
                  className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-semibold text-gray-700 w-16"
                >
                  {idx + 1}
                </th>
              ))}
              <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-semibold text-gray-700 w-14">
                ЗМ
              </th>
              <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-semibold text-gray-700 w-12">
                О
              </th>
              <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-semibold text-gray-700 w-12">
                М
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((rowTeam, rowIdx) => (
              <tr key={rowTeam.id}>
                <td className="border border-gray-300 px-3 py-2 text-center text-gray-600 font-medium">
                  {rowIdx + 1}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">
                  {rowTeam.name}
                </td>
                {teams.map((colTeam, colIdx) => {
                  const cellKey = `${rowTeam.id}-${colTeam.id}`;
                  const isDiagonal = rowTeam.id === colTeam.id;
                  const game = findGame(rowTeam.id, colTeam.id);
                  const result = getGameResult(rowTeam.id, colTeam.id);
                  const isEditing = editingCell === cellKey;

                  if (isDiagonal) {
                    return (
                      <td key={colTeam.id} className="border border-gray-300 px-2 py-2 text-center bg-gray-50">
                        <span className="text-gray-400">—</span>
                      </td>
                    );
                  }

                  return (
                    <td 
                      key={colTeam.id}
                      onClick={() => handleCellClick(rowTeam.id, colTeam.id)}
                      className={`border border-gray-300 px-2 py-2 text-center font-semibold ${
                        isAuthor ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                      } ${result ? 'text-[#8B1E1E]' : 'text-gray-400'}`}
                      title={isAuthor ? 'Нажмите чтобы изменить результат' : ''}
                    >
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={newResult}
                            onChange={(e) => setNewResult(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveResult(game!.id);
                              if (e.key === 'Escape') {
                                setEditingCell(null);
                                setNewResult('');
                              }
                            }}
                            className="w-14 px-1 py-0.5 border border-[#8B1E1E] rounded text-center text-xs focus:outline-none"
                            autoFocus
                            placeholder="3:2"
                          />
                          <button
                            onClick={() => handleSaveResult(game!.id)}
                            className="text-green-600 hover:text-green-800 text-xs"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        result || <span className="text-gray-300">·</span>
                      )}
                    </td>
                  );
                })}
                {(() => {
                  const stat = standings.find(s => s.id === rowTeam.id);
                  if (!stat) return null;
                  const diff = stat.goalsFor - stat.goalsAgainst;
                  const place = getPlace(rowTeam.id);
                  return (
                    <>
                      <td className="border border-gray-300 px-2 py-2 text-center text-gray-700 font-medium">
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-bold text-[#8B1E1E]">
                        {stat.points}
                      </td>
                      <td className={`border border-gray-300 px-2 py-2 text-center font-bold ${
                        place === 'I' ? 'text-yellow-600' :
                        place === 'II' ? 'text-gray-500' :
                        place === 'III' ? 'text-orange-600' :
                        'text-gray-700'
                      }`}>
                        {place}
                      </td>
                    </>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAuthor && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Нажмите на ячейку, чтобы изменить результат игры
        </p>
      )}
    </div>
  );
};