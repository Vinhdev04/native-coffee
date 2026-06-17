import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/Config';
import { UserDetail } from '@/pages/auth/types';
import { getMeApi, logoutApi } from '@/services/authService';
import socketClient from '@/socket/SocketClient';
import { AuthContext } from './AuthContext';

// TODO: Hàm phụ trợ để lấy mã token đã lưu từ bộ nhớ ngoài cây hiển thị react
export const getStoredToken = async () => {
  return await AsyncStorage.getItem('@token');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]   = useState<UserDetail | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Tải thông tin xác thực đã lưu khi bắt đầu khởi tạo
    loadStoredAuth();
  }, []);

  // TODO: Làm phẳng dữ liệu chi tiết người dùng nhận được từ backend
  const flattenUser = (data: any): UserDetail | null => {
    if (!data) return null;
    if (data.user && typeof data.user === 'object') {
      return {
        ...data.user,
        permissions: data.permissions || [],
        role: data.permissions?.[0]?.roleName || data.role_name || data.user.role || null,
      };
    }
    return data;
  };

  // TODO: Tải và đồng bộ trạng thái xác thực từ AsyncStorage
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@token');
      const storedUser  = await AsyncStorage.getItem('@user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(flattenUser(parsedUser));
        setIsAuthenticated(true);
        
        socketClient.initialize(APP_CONFIG.socketUrl, storedToken);

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
          .catch((err) => console.warn('Lỗi đồng bộ /me:', err));
      }
    } catch (e) {
      console.error('Lỗi tải thông tin xác thực đã lưu:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Thực hiện đăng nhập và khởi tạo trạng thái phiên làm việc
  const login = async (newToken: string, userData: any) => {
    try {
      const flattened = flattenUser(userData);
      await AsyncStorage.setItem('@token', newToken);
      await AsyncStorage.setItem('@user', JSON.stringify(flattened));
      setToken(newToken);
      setUser(flattened);
      setIsAuthenticated(true);
      
      socketClient.initialize(APP_CONFIG.socketUrl, newToken);

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
        .catch((err) => console.warn('Lỗi đồng bộ /me trong quá trình đăng nhập:', err));
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    }
  };

  // TODO: Thực hiện đăng xuất và xóa toàn bộ thông tin xác thực
  const logout = async () => {
    try {
      // todo: gọi api đăng xuất chạy ngầm
      logoutApi().catch(err => console.warn('Lỗi API đăng xuất chạy ngầm:', err));
      
      // todo: xóa các mã token trong bộ nhớ cục bộ
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      socketClient.disconnect();
      
      console.log('[Đăng xuất thành công] trạng thái local đã được xóa');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
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
