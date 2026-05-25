import { api } from './axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { confirmPassword, ...data } = credentials;
    const response = await api.post<AuthResponse>('/auth/registration', data);
    return response.data;
  },

  refreshToken: async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', { token });
    return response.data;
  },

  logout: async (token: string): Promise<void> => {
    await api.post('/auth/logout', { token });
  }
};