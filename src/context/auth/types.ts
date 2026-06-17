import { UserDetail } from '@/pages/auth/types';

// todo: giao diện dữ liệu của context xác thực
export interface AuthContextData {
  isAuthenticated: boolean;
  user: UserDetail | null;
  token: string | null;
  login: (token: string, userData: UserDetail) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  userRole: string | null;
}
