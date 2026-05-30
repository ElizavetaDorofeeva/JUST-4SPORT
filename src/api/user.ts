import { api } from './axios';
import { UserProfile } from '../types/profile';

export const userApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/user/profile/${userId}`);
    return response.data;
  }
};