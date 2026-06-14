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
  }
};