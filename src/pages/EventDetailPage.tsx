import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, EventCreateDto, ApplicationDto, Participant, EventDetail } from '../api/event';
import { tokenStorage } from '../utils/tokenStorage';
import { useAuth } from '../contexts/AuthContext';
import { EditEventModal } from '../components/ui/EditEventModal';
import { ApplicationModal } from '../components/ui/ApplicationModal';
import { CommentsSection } from '../components/ui/CommentsSection';
import { EventStatusPanel } from '../components/ui/EventStatusPanel';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TeamDetailsModal } from '../components/ui/TeamDetailsModal';
import { TournamentTable } from '../components/ui/TournamentTable';
import { ScheduleManager } from '../components/ui/ScheduleManager';

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
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userRole, setUserRole] = useState<'NONE' | 'CAPTAIN' | 'MEMBER'>('NONE');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Participant | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [isClosingRegistration, setIsClosingRegistration] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelApplicationConfirm, setShowCancelApplicationConfirm] = useState(false);
  const [showCancelEventConfirm, setShowCancelEventConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleFinishEvent = async () => {
    if (!id) return;
    
    setIsFinishing(true);
    try {
      await eventApi.finishEvent(id);
      setShowFinishConfirm(false);
      await loadEvent();
    } catch (error) {
      console.error('❌ Ошибка при завершении:', error);
      alert('❌ Не удалось завершить мероприятие');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!id) return;
    
    setIsCancelling(true);
    try {
      await eventApi.cancelEvent(id);
      setShowCancelEventConfirm(false);
      await loadEvent();
    } catch (error) {
      console.error('❌ Ошибка при отмене:', error);
      alert('❌ Не удалось отменить мероприятие');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseRegistration = async () => {
    if (!id) return;
    
    setIsClosingRegistration(true);
    try {
      await eventApi.closeRegistration(id);
      setShowCloseConfirm(false);
      await loadEvent();
    } catch (error) {
      console.error('❌ Ошибка при закрытии набора:', error);
      alert('❌ Не удалось закрыть набор');
    } finally {
      setIsClosingRegistration(false);
    }
  };

  useEffect(() => {
    if (id) loadEvent();
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
        if (token) headers['Authorization'] = `Bearer ${token}`;

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
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [event?.photo?.path]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const eventData = await eventApi.getEventById(id!);
      setEvent(eventData);
      
      let participantsData: Participant[];
      
      if (eventData.author.id === user?.id) {
        participantsData = await eventApi.getParticipantsForAuthor(id!);
      } else {
        participantsData = await eventApi.getParticipants(id!);
      }
      
      setParticipants(participantsData);
      
      const role = determineUserRole(participantsData, user?.id);
      setUserRole(role);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (games: Array<{
    id?: string;
    date: string;
    firstParticipantId: string;
    secondParticipantId: string;
  }>) => {
    if (!id) return;
    try {
      await eventApi.updateSchedule(id, games);
      await loadEvent();
    } catch (error) {
      console.error('Failed to update schedule:', error);
      alert('❌ Ошибка при обновлении расписания');
    }
  };

  const handleCancelApplication = async () => {
    if (!id) return;
    
    try {
      await eventApi.cancelApplication(id);
      setUserRole('NONE');
      setShowCancelApplicationConfirm(false);
      await loadEvent();
    } catch (error) {
      console.error('Failed to cancel application:', error);
      alert('❌ Ошибка при отмене заявки');
    }
  };

  const handleUpdateGameResult = async (gameId: string, result: string) => {
    if (!id) return;
    try {
      await eventApi.updateGameResult(id, gameId, result);
      await loadEvent();
    } catch (error) {
      console.error('Failed to update result:', error);
      alert('❌ Ошибка при сохранении результата');
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
    setIsDeleting(true);
    try {
      await eventApi.deleteEvent(id);
      setShowDeleteConfirm(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('❌ Ошибка при удалении мероприятия');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitApplication = async (application: ApplicationDto) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await eventApi.submitApplication(id, application);
      setShowApplicationModal(false);
      await loadEvent();
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('❌ Ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
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
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTeamClick = (teamId: string) => {
    const team = participants.find(t => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      setShowTeamModal(true);
    }
  };

  const getSportLabel = (sport: string) => {
    const labels: { [key: string]: string } = {
      VOLLEYBALL: 'Волейбол', BASKETBALL: 'Баскетбол',
      SOCCER: 'Футбол', HOCKEY: 'Хоккей', ULTIMATE: 'Алтимат'
    };
    return labels[sport] || sport;
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      START: 'Новичок', MEDIUM: 'Средний', HARD: 'Продвинутый'
    };
    return labels[level] || level;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      TRAINING: 'Тренировка', GAME: 'Игра', TOURNAMENT: 'Турнир'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      WILL_BE: 'Предстоит', UNDERWAY: 'В процессе',
      FINISHED: 'Завершено', CANCELLED: 'Отменено'
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

  const determineUserRole = (participants: Participant[], userId: string | undefined): 'NONE' | 'CAPTAIN' | 'MEMBER' => {
    if (!userId) return 'NONE';
    
    for (const team of participants) {
      if (team.captain.id === userId) {
        return 'CAPTAIN';
      }
      
      if (team.teamMembers.some(member => member.id === userId)) {
        return 'MEMBER';
      }
    }
    
    return 'NONE';
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
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#8B1E1E] hover:text-[#6B1616] transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

          {isAuthor && event.eventStatus === 'WILL_BE' && (
            event.registrationClosed ? (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-medium text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Набор закрыт
              </div>
            ) : (
              <button
                onClick={() => setShowCloseConfirm(true)}
                disabled={isClosingRegistration}
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 border border-green-200"
              >
                {isClosingRegistration ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Закрытие...
                  </>
                ) : (
                  <>
                    Закрыть набор
                  </>
                )}
              </button>
            )
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <h1 className="text-4xl font-bold text-gray-900 flex-1 min-w-[200px]">
              {event.name}
            </h1>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(event.eventStatus)}`}>
              {getStatusLabel(event.eventStatus)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {photoUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <img 
                  src={photoUrl} 
                  alt={event.name}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            {event.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Описание</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Детали</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Тип</p>
                  <p className="text-lg font-medium text-gray-900">{getEventTypeLabel(event.eventType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Вид спорта</p>
                  <p className="text-lg font-medium text-gray-900">{getSportLabel(event.sport)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Уровень</p>
                  <p className="text-lg font-medium text-gray-900">{getSkillLevelLabel(event.skillLevel)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Стоимость</p>
                  <p className="text-lg font-medium text-gray-900">
                    {event.cost === 0 ? 'Бесплатно' : `${event.cost} ₽`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Начало</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(event.dateStart)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Окончание</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(event.dateEnd)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Место</p>
                  <p className="text-lg font-medium text-gray-900">{event.place}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Дедлайн записи</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(event.deadline)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Организатор</h2>
              <div 
                onClick={() => {
                  if (user?.id === event.author.id) {
                    navigate('/profile');
                  } else {
                    navigate(`/users/${event.author.id}`);
                  }
                }}
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#8B1E1E]/30 border border-transparent transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {event.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 truncate">
                    {event.author.name}
                  </p>
                  <p className="text-gray-500 truncate">
                    @{event.author.nickname}
                  </p>
                </div>
                <svg 
                  className="w-5 h-5 text-gray-400 group-hover:text-[#8B1E1E] transition-colors flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {event.teams && event.teams.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Команды
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.teams.map(team => (
                    <div 
                      key={team.id} 
                      onClick={() => handleTeamClick(team.id)}
                      className="px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-800 border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 hover:border-[#8B1E1E]/30 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate flex-1">{team.name}</span>
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

            {isAuthor && event.eventType === 'TOURNAMENT' && (
              <ScheduleManager
                event={event}
                onUpdateSchedule={handleUpdateSchedule}
              />
            )}

            {event.eventType === 'TOURNAMENT' && event.teams && event.teams.length > 0 && (
              <TournamentTable
                event={event}
                isAuthor={isAuthor}
                onUpdateResult={handleUpdateGameResult}
              />
            )}

            {event.eventType === 'TOURNAMENT' && event.schedule?.games && event.schedule.games.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Расписание игр
                </h2>
                <div className="space-y-3">
                  {event.schedule.games.map(game => (
                    <div key={game.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-600 min-w-[180px]">
                        {formatDate(game.date)}
                      </span>
                      <div className="flex-1 flex items-center justify-center gap-3">
                        <span className="font-semibold text-gray-900 text-right flex-1 truncate">
                          {game.firstParticipant.name}
                        </span>
                        <span className="text-gray-400 font-bold text-sm">vs</span>
                        <span className="font-semibold text-gray-900 text-left flex-1 truncate">
                          {game.secondParticipant.name}
                        </span>
                      </div>
                      {game.result && game.result !== 'string' && (
                        <span className="text-sm font-semibold text-[#8B1E1E] bg-white px-3 py-1 rounded-lg border border-gray-200 min-w-[60px] text-center">
                          {game.result}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.eventType !== 'TOURNAMENT' && event.schedule?.games && event.schedule.games.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Расписание игр
                </h2>
                <div className="space-y-3">
                  {event.schedule.games.map(game => (
                    <div key={game.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                            {formatDate(game.date)}
                        </span>
                        {game.result && game.result !== 'string' && (
                          <span className="text-sm font-semibold text-[#8B1E1E] bg-white px-3 py-1 rounded-lg border border-gray-200">
                            {game.result}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                          <p className="font-semibold text-gray-900">{game.firstParticipant.name}</p>
                        </div>
                        <span className="text-gray-400 font-bold">vs</span>
                        <div className="flex-1 text-center">
                          <p className="font-semibold text-gray-900">{game.secondParticipant.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <EventStatusPanel
              userRole={userRole}
              isAuthor={isAuthor}
              eventStatus={event.eventStatus}
              registrationClosed={event.registrationClosed}
              onApply={() => setShowApplicationModal(true)}
              onCancel={() => setShowCancelApplicationConfirm(true)}  // ✅ Исправлено
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowDeleteConfirm(true)}
              onFinish={() => setShowFinishConfirm(true)}              // ✅ Добавлено
              onCancelEvent={() => setShowCancelEventConfirm(true)}    // ✅ Добавлено
              isFinishing={isFinishing}                                // ✅ Добавлено
              isCancelling={isCancelling}                              // ✅ Добавлено
            />
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <CommentsSection
                eventId={event.id}
                comments={event.comments || []}
                onCommentsChanged={loadEvent}
              />
            </div>
          </div>
        </div>
      </div>

      {isAuthor && (
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateEvent}
          initialData={{
            ...getEventDataForEdit(),
            photo: event.photo
          }}
          eventId={event.id}
          onPhotoChanged={loadEvent}
          loading={isUpdating}
        />
      )}

      {!isAuthor && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleSubmitApplication}
          loading={isSubmitting}
          sport={event.sport}
        />
      )}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удаление мероприятия"
        message="Вы действительно хотите удалить все данные о мероприятие?"
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        isOpen={showCancelApplicationConfirm}
        title="Отмена заявки"
        message="Вы уверены, что хотите отозвать заявку на участие?"
        confirmText="Отозвать"
        cancelText="Отмена"
        onConfirm={handleCancelApplication}
        onCancel={() => setShowCancelApplicationConfirm(false)}
      />

      <ConfirmModal
        isOpen={showCancelEventConfirm}
        title="Отменить мероприятие"
        message="Вы уверены, что хотите отменить это мероприятие? Мероприятие останется в системе, но будет помечено как отменённое."
        confirmText="Отменить"
        cancelText="Нет"
        onConfirm={handleCancelEvent}
        onCancel={() => setShowCancelEventConfirm(false)}
      />

      <TeamDetailsModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        team={selectedTeam}
        eventId={event.id}
        isAuthor={isAuthor}
        onTeamDeleted={loadEvent}
      />

      <ConfirmModal
        isOpen={showCloseConfirm}
        title="Закрытие набора"
        message="После закрытия набора участники больше не смогут подавать заявки на это мероприятие. Продолжить?"
        confirmText="Закрыть набор"
        cancelText="Отмена"
        onConfirm={handleCloseRegistration}
        onCancel={() => setShowCloseConfirm(false)}
      />

      <ConfirmModal
        isOpen={showFinishConfirm}
        title="Завершить мероприятие"
        message="Вы уверены, что хотите завершить это мероприятие?"
        confirmText="Завершить"
        cancelText="Отмена"
        onConfirm={handleFinishEvent}
        onCancel={() => setShowFinishConfirm(false)}
      />
    </div>
  );
};