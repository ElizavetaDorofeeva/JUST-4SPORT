import { api } from './axios';

export interface EventCreateDto {
  name: string;
  description: string;
  place: string;
  cost: number;
  sport: string;
  eventType: string;
  skillLevel: string;
  teamsNumber: number;
  dateStart: string;
  dateEnd: string;
  deadline: string | null;
}

export interface ApplicationDto {
  name: string;
  captainNickname: string;
  membersNicknames: string[];
  contactInformation: string;
}

export interface EventPhoto {
  id: string;
  path: string;
  title: string;
}

export interface Event {
  id: string;
  name: string;
  dateStart: string;
  dateEnd: string;
  cost: number;
  sport: string;
  eventType: string;
  skillLevel: string;
  eventStatus: string;
  photo: EventPhoto | null;
  place?: string;
}

export interface EventsResponse {
  content: Event[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface EventFilters {
  status?: string;
  name?: string;
  dateStart?: string;
  dateEnd?: string;
  costStart?: number;
  costEnd?: number;
  sport?: string;
  eventType?: string;
  skillLevel?: string;
  sortField?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

export interface CommentDto {
  content: string;
  parentId?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  parentId: string | null;
}

export interface Participant {
  id: string;
  name: string;
  captain: {
    id: string;
    name: string;
    nickname: string;
  };
  teamMembers: Array<{
    id: string;
    name: string;
    nickname: string;
  }>;
  contactInformation: string; 
}

export interface EventDetail {
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
  registrationClosed?: boolean;
}

export const eventApi = {
  createEvent: async (eventData: EventCreateDto, imageFile?: File) => {
    const formData = new FormData();
    
    const eventBlob = new Blob([JSON.stringify(eventData)], { 
      type: 'application/json' 
    });
    formData.append('event', eventBlob);
    
    if (imageFile) {
      formData.append('file', imageFile);
    }

    const response = await api.post('/events', formData);
    return response.data;
  },

  getEvents: async (filters?: EventFilters): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/events?${queryString}` : '/events';
    
    const response = await api.get(url);
    return response.data;
  },

  getEventById: async (eventId: string) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  joinEvent: async (eventId: string) => {
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  },

  leaveEvent: async (eventId: string) => {
    const response = await api.post(`/events/${eventId}/leave`);
    return response.data;
  },

  updateEvent: async (eventId: string, eventData: EventCreateDto): Promise<void> => {
    await api.put(`/author-events/${eventId}`, eventData);
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/author-events/${eventId}`);
  },

  submitApplication: async (eventId: string, application: ApplicationDto): Promise<void> => {
    await api.post(`/event/${eventId}/application`, application);
  },

  addComment: async (eventId: string, comment: CommentDto): Promise<void> => {
    await api.post(`/comment/${eventId}`, comment);
  },

  updateComment: async (commentId: string, content: string): Promise<void> => {
    await api.put(`/comment/${commentId}`, { content });
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comment/${commentId}`);
  },

  cancelApplication: async (eventId: string): Promise<void> => {
    await api.delete(`/event/${eventId}/application`);
  },

  getParticipants: async (eventId: string): Promise<Participant[]> => {
    try {
      const response = await api.get(`/participants/${eventId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('⚠️ Нет доступа к участникам мероприятия');
        return [];
      }
      throw error;
    }
  },

  getParticipantsForAuthor: async (eventId: string): Promise<Participant[]> => {
    try {
      const response = await api.get(`/participants/${eventId}/author`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Ошибка получения участников:', error);
      throw error;
    }
  },

  uploadEventPhoto: async (eventId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/author-events/${eventId}/photo`, formData);
  },

  deleteEventPhoto: async (eventId: string): Promise<void> => {
    await api.delete(`/author-events/${eventId}/photo`);
  },

  updateGameResult: async (eventId: string, gameId: string, result: string): Promise<void> => {
    await api.put(`/author-events/${eventId}/table`, [{
      id: gameId,
      result: result
    }]);
  },

  updateSchedule: async (eventId: string, games: Array<{
    id?: string;
    date: string;
    firstParticipantId: string;
    secondParticipantId: string;
  }>): Promise<void> => {
    await api.put(`/author-events/${eventId}/schedule`, { games });
  },

  deleteTeam: async (eventId: string, teamId: string): Promise<void> => {
    await api.delete(`/participants/${eventId}/${teamId}`);
  },

  closeRegistration: async (eventId: string): Promise<void> => {
    await api.put(`/participants/${eventId}/close`);
  },

  finishEvent: async (eventId: string): Promise<void> => {
    await api.put(`/author-events/${eventId}/finish`);
  },

  cancelEvent: async (eventId: string): Promise<void> => {
    await api.put(`/author-events/${eventId}/cancel`);
  }
};