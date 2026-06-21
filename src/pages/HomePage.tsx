import React, { useState, useEffect } from 'react';
import { eventApi, Event, EventFilters } from '../api/event';
import { MainEventCard } from '../components/ui/MainEventCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const SORT_OPTIONS = [
  { value: 'DATE,ASC', label: 'По дате (сначала ранние)' },
  { value: 'DATE,DESC', label: 'По дате (сначала поздние)' },
  { value: 'COST,ASC', label: 'По стоимости (сначала дешёвые)' },
  { value: 'COST,DESC', label: 'По стоимости (сначала дорогие)' }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    page: 0,
    size: 20,
    sortField: 'DATE',
    sortDirection: 'ASC'
  });

  const [searchName, setSearchName] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  
  const [costStart, setCostStart] = useState('');
  const [costEnd, setCostEnd] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortBy, setSortBy] = useState('DATE,ASC');
  const [eventStatus, setEventStatus] = useState('');

  const STATUS_OPTIONS = [
    { value: '', label: '- -' },
    { value: 'WILL_BE', label: 'Предстоит' },
    { value: 'UNDERWAY', label: 'В процессе' },
    { value: 'FINISHED', label: 'Завершено' },
    { value: 'CANCELLED', label: 'Отменено' }
  ];

  useEffect(() => {
    loadEvents();
  }, [filters, sortBy]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [sortField, sortDirection] = sortBy.split(',');
      const formatDateTime = (dateTimeStr: string) => {
        if (!dateTimeStr) return undefined;
        if (dateTimeStr.length === 16) {
          return `${dateTimeStr}:00`;
        }
        return dateTimeStr;
      };
      
      const filtersToSend: EventFilters = {
        ...filters,
        name: searchName || undefined,
        status: eventStatus || undefined,
        costStart: costStart ? Number(costStart) : undefined,
        costEnd: costEnd ? Number(costEnd) : undefined,
        dateStart: formatDateTime(dateStart),
        dateEnd: formatDateTime(dateEnd),
        sortField,
        sortDirection
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

  const clearAllFilters = () => {
    setFilters({
      page: 0,
      size: 20
    });
    setSearchName('');
    setEventStatus('');
    setRegistrationOpen(false);
    setCostStart('');
    setCostEnd('');
    setDateStart('');
    setDateEnd('');
    setSortBy('DATE,ASC');
  };

  const hasActiveFilters = 
    filters.sport || filters.skillLevel || filters.eventType || 
    costStart || costEnd || dateStart || dateEnd || 
    sortBy !== 'DATE,ASC';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Поиск мероприятий..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

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
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 border rounded-xl transition-colors flex items-center gap-2 ${
                showAdvancedFilters 
                  ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>Фильтры</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors"
            >
              Найти
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость от
                  </label>
                  <input
                    type="number"
                    value={costStart}
                    onChange={(e) => setCostStart(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость до
                  </label>
                  <input
                    type="number"
                    value={costEnd}
                    onChange={(e) => setCostEnd(e.target.value)}
                    placeholder="10000"
                    min="0"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сортировка
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата начала с
                  </label>
                  <input
                    type="datetime-local"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата завершения по
                  </label>
                  <input
                    type="datetime-local"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Сбросить
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors"
                >
                  Применить фильтры
                </button>
              </div>
            </div>
          )}
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
      {isAuthenticated && (
        <button
          onClick={() => navigate('/create')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#8B1E1E] text-white rounded-full shadow-lg hover:bg-[#6B1616] transition-all flex items-center justify-center hover:active:z-40 group"
          title="Создать мероприятие"
        >
          <svg 
            className="w-8 h-8 group-hover:transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </button>
      )}
    </div>
  );
};