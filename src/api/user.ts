import { api } from './axios';
import { UserProfile } from '../types/profile';

export interface UpdateProfileDto {
  name?: string;
  nickname?: string;
  email?: string;
  favoriteSports?: string[];
}

export interface PhotoDto {
  title: string;
  path: string;
}

export const userApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await api.put(`/profile/${userId}`, data);
    return response.data;
  },

  deleteProfile: async (userId: string): Promise<void> => {
    await api.delete(`/profile/${userId}`);
  },

  updatePhoto: async (userId: string, photoData: PhotoDto): Promise<void> => {
    await api.put(`/profile/${userId}/photo`, photoData);
  },

  deletePhoto: async (userId: string): Promise<void> => {
    await api.delete(`/profile/${userId}/photo`);
  }
};