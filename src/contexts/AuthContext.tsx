import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { tokenStorage } from '../utils/tokenStorage';
import { User, AuthTokens, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    const data = JSON.parse(decoded);

    return data.userId ?? null;
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      const userId = getUserIdFromToken(token);
      setUser({
        id: userId || '',
        email: 'user@example.com',
        name: 'User',
        nickname: 'user'
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authApi.login(credentials);
    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
    
    const userId = getUserIdFromToken(data.accessToken);
    
    setUser({
      id: userId || '',
      email: credentials.email,
      name: credentials.email.split('@')[0],
      nickname: credentials.email.split('@')[0]
    });
  };

  const register = async (credentials: RegisterCredentials) => {
    const data = await authApi.register(credentials);
    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });

    const userId = getUserIdFromToken(data.accessToken);

    setUser({
      id: userId || '',
      name: credentials.name,
      nickname: credentials.nickname,
      email: credentials.email
    });
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {});
    }
    tokenStorage.removeTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};