/**
 * @file authService.ts
 * @desc Service quản lý xác thực — cung cấp các hàm gọi API để login,
 *       logout và lấy thông tin tài khoản hiện tại.
 * @layer services
 */

import axiosClient from '@/api/axiosClient';
import { LoginPayload, LoginResponse } from '@/pages/auth/types';

/**
 * Đăng nhập hệ thống
 * @param payload { username, password }
 */
export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosClient.post('/auth/login', payload);
  return response as unknown as LoginResponse;
};

/**
 * Đăng ký tài khoản mới
 * @param payload { username, password, fullName, ... }
 */
export const registerApi = async (payload: any): Promise<any> => {
  const response = await axiosClient.post('/auth/register', payload);
  return response;
};

/**
 * Đăng xuất hệ thống
 */
export const logoutApi = async () => {
  try {
    const response = await axiosClient.post('/auth/logout');
    return response;
  } catch (error) {
    // Thường thì logout lỗi vẫn cho phép user thoát ở phía client
    console.warn('API Logout error:', error);
    return null;
  }
};

/**
 * Lấy thông tin người dùng hiện tại (Profile)
 */
export const getMeApi = async () => {
  const response = await axiosClient.get('/auth/me');
  return response;
};
