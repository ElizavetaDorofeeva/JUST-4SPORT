import { api } from './axios';
import { UserProfile } from '../types/profile';

export interface UpdateProfileDto {
  name?: string;
  nickname?: string;
  email?: string;
  favoriteSports?: string[];
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  deleteProfile: async (): Promise<void> => {
    await api.delete('/profile');
  },

  updatePhoto: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post('/profile/photo', formData);
  },

  deletePhoto: async (): Promise<void> => {
    await api.delete('/profile/photo');
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  }
};