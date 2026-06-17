/**
 * @file axiosClient.ts
 * @desc HTTP client singleton (Axios) — cấu hình base URL, timeout,
 *       tự động gắn Bearer token vào request và xử lý lỗi response tập trung.
 * @layer api
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { APP_CONFIG } from "@/constants/Config";
// Removed AuthContext import to break require cycle

const axiosClient = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Ghi nhật ký yêu cầu và đính kèm Token
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@token");
    const isPublic = config.url?.includes("/auth/login") || config.url?.includes("/auth/forgot_password") || config.url?.startsWith("/public/");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[Đính kèm Token] cho ${config.url}`);
    } else if (isPublic) {
      console.log(`[Yêu cầu Công khai] ${config.url} - Không đính kèm token`);
    }
    console.log(
      `[Yêu cầu API] ${config.method?.toUpperCase()} ${config.url}`,
      config.data || "",
    );
    return config;
  },
  (error) => {
    console.error("[Lỗi Yêu cầu API]", error);
    return Promise.reject(error);
  },
);

// Ghi nhật ký phản hồi
axiosClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    console.log(`[Phản hồi API] ${response.config.url}:`, res);

    const AUTH_ERROR_CODES = [
      "AUTHEN000",
      "AUTHEN001",
      "AUTHEN002",
      "AUTHEN003",
    ];

    // Chỉ coi là lỗi nếu có res_code và res_code khác 0
    if (res && res.hasOwnProperty('res_code') && res.res_code !== 0) {
      if (AUTH_ERROR_CODES.includes(res.error_code)) {
        Toast.show({
          type: "error",
          text1: "Phiên đăng nhập hết hạn",
          text2: "Vui lòng đăng nhập lại.",
          position: "bottom",
        });
        AsyncStorage.clear();
      } else if (res.error_cont) {
        Toast.show({
          type: "error",
          text1: "Lỗi hệ thống",
          text2: res.error_cont,
          position: "bottom",
        });
      }
    }
    return res;
  },
  (error) => {
    const url = error.config?.url || '';
    const isNetworkError = !error.response; // Không có phản hồi nghĩa là lỗi mạng hoặc máy chủ dừng hoạt động
    const isBackgroundCheck = url.includes('/auth/me');

    console.error(
      '[Lỗi Phản hồi API]',
      error.response?.data || error.message,
    );

    // Không hiển thị thông báo cho tác vụ kiểm tra tài khoản nền khi máy chủ không kết nối được
    if (isBackgroundCheck && isNetworkError) {
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.error_cont ||
      (isNetworkError ? 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng.' : error.message) ||
      'Kết nối máy chủ thất bại';

    Toast.show({
      type: 'error',
      text1: isNetworkError ? '📡 Mất kết nối' : 'Lỗi kết nối',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
    });
    return Promise.reject(error);
  },
);

export default axiosClient;
