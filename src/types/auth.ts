export interface User {
  id?: string;
  name: string;
  nickname: string;
  email: string;
  favoriteSports?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  favoriteSports?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}