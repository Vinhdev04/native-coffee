/**
 * @file AuthContext.tsx
 * @desc Context xác thực toàn cục — lưu trữ token, thông tin user,
 *       xử lý login/logout và đồng bộ session qua API và Socket.
 * @layer context
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/Config';
import { UserDetail, LoginResponse } from '@/pages/auth/types';
import { BaseResponse } from '@/pages/types';
import { getMeApi, logoutApi } from '@/services/authService';

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
        // No socket init needed
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(flattenUser(parsedUser));
        setIsAuthenticated(true);

        getMeApi()
          .then((res) => {
            const body: any = res;
            const syncData = body?.rows?.[0] || body?.user || body?.data;
            if (syncData) {
              const flattened = flattenUser(syncData);
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

      getMeApi()
        .then((response) => {
          const body: any = response;
          const syncData = body?.rows?.[0] || body?.user || body?.data;
          if (syncData) {
            const syncUser = flattenUser(syncData);
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
    try {
      // Gọi API logout nhưng không dùng await để tránh treo UI
      logoutApi().catch(err => console.warn('Background logout API error:', err));
      
      // Xóa dữ liệu local ngay lập tức
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful (local state cleared)');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
