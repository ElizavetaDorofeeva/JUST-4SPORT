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

  updateProfile: async (userId: string, data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await api.put(`/profile/${userId}`, data);
    return response.data;
  },

  deleteProfile: async (userId: string): Promise<void> => {
    await api.delete(`/profile/${userId}`);
  },

  updatePhoto: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await api.put('/profile/photo', formData);
  },

  deletePhoto: async (): Promise<void> => {
    await api.delete('/profile/photo');
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  }
};