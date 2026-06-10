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

  getEvents: async () => {
    const response = await api.get('/events');
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
  }
};