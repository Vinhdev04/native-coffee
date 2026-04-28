/**
 * @file AuthContext.tsx
 * @desc Context xác thực toàn cục — lưu trữ token, thông tin user,
 *       xử lý login/logout và đồng bộ session qua API và Socket.
 * @layer context
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketClient from '~/socket/SocketClient';
import { APP_CONFIG } from '~/constants/Config';
import axiosClient from '~/api/axiosClient';
import { UserDetail } from '~/pages/auth/types';
import { BaseResponse } from '~/pages/types';

interface AuthContextData {
  isAuthenticated: boolean;
  user: UserDetail | null;
  token: string | null;
  login: (token: string, userData: UserDetail) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]   = useState<UserDetail | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    socketClient.setOnAuthError(logout);
  }, []);

  /** Làm phẳng dữ liệu user nếu API trả về { user: {...}, permissions: [...] } */
  const flattenUser = (data: any): UserDetail | null => {
    if (!data) return null;
    if (data.user && typeof data.user === 'object') {
      return {
        ...data.user,
        permissions: data.permissions || [],
        role: data.role_name || data.user.role || null,
      };
    }
    return data;
  };

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@token');
      const storedUser  = await AsyncStorage.getItem('@user');

      if (!storedToken) {
        socketClient.initialize(APP_CONFIG.socketUrl);
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(flattenUser(parsedUser));
        setIsAuthenticated(true);

        socketClient.initialize(APP_CONFIG.socketUrl, storedToken);

        axiosClient
          .get('/auth/me')
          .then((res) => {
            const body: any = res;
            if (body?.rows?.length > 0) {
              const flattened = flattenUser(body.rows[0]);
              if (flattened) {
                setUser(flattened);
                AsyncStorage.setItem('@user', JSON.stringify(flattened));
              }
            }
          })
          .catch((err) => console.warn('Sync /me error:', err));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userData: any) => {
    try {
      const flattened = flattenUser(userData);
      await AsyncStorage.setItem('@token', newToken);
      await AsyncStorage.setItem('@user', JSON.stringify(flattened));
      setToken(newToken);
      setUser(flattened);
      setIsAuthenticated(true);

      socketClient.initialize(APP_CONFIG.socketUrl, newToken);

      axiosClient
        .get('/auth/me')
        .then((response) => {
          const body: any = response;
          if (body?.rows?.length > 0) {
            const syncUser = flattenUser(body.rows[0]);
            if (syncUser) {
              const finalUser = { ...flattened, ...syncUser };
              setUser(finalUser);
              AsyncStorage.setItem('@user', JSON.stringify(finalUser));
            }
          }
        })
        .catch((err) => console.warn('Sync /me error during login:', err));
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    socketClient.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, login, logout, isLoading, userRole: user?.role || null }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

/** Helper để lấy token bên ngoài component (dùng cho axios/socket) */
export const getStoredToken = async () => {
  return await AsyncStorage.getItem('@token');
};
