import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, EventCreateDto } from '../api/event';
import { tokenStorage } from '../utils/tokenStorage';
import { useAuth } from '../contexts/AuthContext';
import { EditEventModal } from '../components/ui/EditEventModal';

interface EventDetail {
  id: string;
  eventStatus: string;
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  place: string;
  cost: number;
  sport: string;
  eventType: string;
  skillLevel: string;
  author: {
    id: string;
    name: string;
    nickname: string;
  };
  photo: {
    id: string;
    title: string;
    path: string;
  } | null;
  schedule: {
    id: string;
    games: Array<{
      id: string;
      date: string;
      result: string;
      firstParticipant: { id: string; name: string };
      secondParticipant: { id: string; name: string };
    }>;
  } | null;
  teams: Array<{
    id: string;
    name: string;
  }>;
  deadline: string;
  teamsNumber: number;
  comments: Array<{
    id: string;
    content: string;
    authorName: string;
    authorId: string;
    parentId: string | null;
  }>;
}

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    const loadPhoto = async () => {
      if (!event?.photo?.path) {
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
  }, [event?.photo?.path]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await eventApi.getEventById(id!);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (data: EventCreateDto) => {
  if (!id) return;
  
  setIsUpdating(true);
  try {
    const formatDateTime = (dateString: string) => {
      if (!dateString) return null;
      return dateString.length === 16 ? `${dateString}:00` : dateString;
    };

    const payload = {
      name: data.name,
      description: data.description,
      place: data.place,
      cost: Number(data.cost),
      sport: event!.sport,
      eventType: event!.eventType,
      skillLevel: event!.skillLevel,
      teamsNumber: Number(data.teamsNumber),
      dateStart: formatDateTime(data.dateStart),
      dateEnd: formatDateTime(data.dateEnd),
      deadline: data.deadline ? formatDateTime(data.deadline) : null
    };
    
    await eventApi.updateEvent(id, payload as any);
    await loadEvent();
    setShowEditModal(false);
  } catch (error) {
    console.error('Failed to update event:', error);
    alert('❌ Ошибка при обновлении мероприятия');
  } finally {
    setIsUpdating(false);
  }
};

  const handleDeleteEvent = async () => {
    if (!id) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await eventApi.deleteEvent(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('❌ Ошибка при удалении мероприятия');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = event && user ? event.author.id === user.id : false;

  const getEventDataForEdit = (): EventCreateDto => {
    if (!event) return {} as EventCreateDto;
    
    const formatForInput = (isoString: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    return {
      name: event.name,
      description: event.description,
      place: event.place,
      cost: event.cost,
      sport: event.sport,
      eventType: event.eventType,
      skillLevel: event.skillLevel,
      teamsNumber: event.teamsNumber,
      dateStart: formatForInput(event.dateStart),
      dateEnd: formatForInput(event.dateEnd),
      deadline: event.deadline ? formatForInput(event.deadline) : null
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSportLabel = (sport: string) => {
    const labels: { [key: string]: string } = {
      VOLLEYBALL: 'Волейбол',
      BASKETBALL: 'Баскетбол',
      SOCCER: 'Футбол',
      HOCKEY: 'Хоккей',
      ULTIMATE: 'Альтимат'
    };
    return labels[sport] || sport;
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      START: 'Новичок',
      MEDIUM: 'Средний',
      HARD: 'Продвинутый'
    };
    return labels[level] || level;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      TRAINING: 'Тренировка',
      GAME: 'Игра',
      TOURNAMENT: 'Турнир'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      WILL_BE: 'Предстоит',
      UNDERWAY: 'В процессе',
      FINISHED: 'Завершено',
      CANCELLED: 'Отменено'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      WILL_BE: 'bg-green-100 text-green-800',
      UNDERWAY: 'bg-blue-100 text-blue-800',
      FINISHED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Мероприятие не найдено</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-[#8B1E1E] hover:text-[#6B1616] transition-colors font-medium"
        >
          ← Назад
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          
          {photoUrl && (
            <div className="w-full h-64 bg-gray-100">
              <img 
                src={photoUrl} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.name}
                </h1>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(event.eventStatus)}`}>
                  {getStatusLabel(event.eventStatus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Тип мероприятия
                </h3>
                <p className="text-lg text-gray-900">
                  {getEventTypeLabel(event.eventType)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Вид спорта
                </h3>
                <p className="text-lg text-gray-900">
                  {getSportLabel(event.sport)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Уровень
                </h3>
                <p className="text-lg text-gray-900">
                  {getSkillLevelLabel(event.skillLevel)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Стоимость
                </h3>
                <p className="text-lg text-gray-900">
                  {event.cost === 0 ? 'Бесплатно' : `${event.cost} ₽`}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Дата начала
                  </h3>
                  <p className="text-gray-900">
                    {formatDate(event.dateStart)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Дата окончания
                  </h3>
                  <p className="text-gray-900">
                    {formatDate(event.dateEnd)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Место проведения
                  </h3>
                  <p className="text-gray-900">
                    {event.place}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Дедлайн записи
                  </h3>
                  <p className="text-gray-900">
                    {formatDate(event.deadline)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Организатор
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {event.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {event.author.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    @{event.author.nickname}
                  </p>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Описание
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {event.teams && event.teams.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Команды ({event.teams.length})
                </h3>
                <div className="space-y-2">
                  {event.teams.map(team => (
                    <div key={team.id} className="px-4 py-2 bg-gray-50 rounded-lg">
                      {team.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.schedule?.games && event.schedule.games.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Расписание игр
                </h3>
                <div className="space-y-3">
                  {event.schedule.games.map(game => (
                    <div key={game.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {formatDate(game.date)}
                        </span>
                        {game.result && (
                          <span className="text-sm font-medium text-gray-900">
                            {game.result}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {game.firstParticipant.name}
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium text-gray-900">
                          {game.secondParticipant.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAuthor && event.eventStatus === 'WILL_BE' && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  disabled={isUpdating}
                  className="w-full py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors font-medium text-lg disabled:opacity-50"
                >
                  {isUpdating ? 'Сохранение...' : 'Редактировать мероприятие'}
                </button>
                
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-lg disabled:opacity-50"
                >
                  {isDeleting ? 'Удаление...' : 'Удалить мероприятие'}
                </button>
              </div>
            )}

            {!isAuthor && event.eventStatus === 'WILL_BE' && (
              <button
                className="w-full py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors font-medium text-lg"
              >
                Подать заявку
              </button>
            )}
          </div>
        </div>
      </div>

      {isAuthor && (
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateEvent}
          initialData={getEventDataForEdit()}
          loading={isUpdating}
        />
      )}
    </div>
  );
};