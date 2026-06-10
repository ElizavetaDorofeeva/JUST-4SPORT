import React, { useState, useEffect } from 'react';
import { eventApi, Event, EventFilters } from '../api/event';
import { MainEventCard } from '../components/ui/MainEventCard';

const SPORTS = [
  { value: '', label: 'Все виды' },
  { value: 'VOLLEYBALL', label: 'Волейбол' },
  { value: 'BASKETBALL', label: 'Баскетбол' },
  { value: 'SOCCER', label: 'Футбол' },
  { value: 'HOCKEY', label: 'Хоккей' },
  { value: 'ULTIMATE', label: 'Алтимат' }
];

const SKILL_LEVELS = [
  { value: '', label: 'Все уровни' },
  { value: 'START', label: 'Новичок' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'HARD', label: 'Продвинутый' }
];

const EVENT_TYPES = [
  { value: '', label: 'Все типы' },
  { value: 'TRAINING', label: 'Тренировка' },
  { value: 'GAME', label: 'Игра' },
  { value: 'TOURNAMENT', label: 'Турнир' }
];

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    page: 0,
    size: 20,
    sortField: 'DATE',
    sortDirection: 'ASC'
  });

  const [searchName, setSearchName] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const filtersToSend: EventFilters = {
        ...filters,
        name: searchName || undefined,
        status: registrationOpen ? 'WILL_BE' : undefined
      };
      
      const response = await eventApi.getEvents(filtersToSend);
      setEvents(response.content);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSearch = () => {
    loadEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <input
            type="text"
            placeholder="Поиск мероприятий..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
          />

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вид спорта
              </label>
              <select
                value={filters.sport || ''}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              >
                {SPORTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Уровень
              </label>
              <select
                value={filters.skillLevel || ''}
                onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              >
                {SKILL_LEVELS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип
              </label>
              <select
                value={filters.eventType || ''}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              >
                {EVENT_TYPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="registrationOpen"
                checked={registrationOpen}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
                className="w-4 h-4 text-[#8B1E1E] border-gray-300 rounded focus:ring-[#8B1E1E]"
              />
              <label htmlFor="registrationOpen" className="text-sm text-gray-700">
                Набор ведется
              </label>
            </div>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors"
            >
              Найти
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Загрузка...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Мероприятия не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <MainEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};