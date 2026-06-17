import { createContext, useContext } from 'react';
import { AuthContextData } from './types';

// todo: thực thể react context dùng cho xác thực
export const AuthContext = createContext<AuthContextData | null>(null);

// TODO: Hook tùy chỉnh để sử dụng AuthContext dễ dàng trong các component react
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
