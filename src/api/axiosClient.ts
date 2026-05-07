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

// LOG REQUEST & Gắn Token
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@token");
    const userStr = await AsyncStorage.getItem("@user");
    
    let screenCode = "APP"; // Fallback
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj?.permissions && Array.isArray(userObj.permissions)) {
          for (const p of userObj.permissions) {
            if (p.permissions && Array.isArray(p.permissions) && p.permissions.length > 0) {
               // Thường API trả về [{ roleCode: 'ADMIN', permissions: ['MENU_VIEW', ...] }]
               const firstPerm = p.permissions[0];
               if (typeof firstPerm === 'string') {
                 screenCode = firstPerm;
               } else if (firstPerm.screenCode || firstPerm.router_screen || firstPerm.code) {
                 screenCode = firstPerm.screenCode || firstPerm.router_screen || firstPerm.code;
               }
               break;
            } else if (typeof p === 'string') {
               screenCode = p;
               break;
            }
          }
        }
      } catch (e) {
        // Ignore parse error
      }
    }

    const isPublic = config.url?.includes("/auth/login") || config.url?.includes("/auth/forgot_password") || config.url?.startsWith("/public/");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["x-screen-code"] = screenCode;
      console.log(`🔑 [Token Attached] to ${config.url}`);
    } else if (isPublic) {
      console.log(`🔓 [Public Request] ${config.url} - No token attached`);
    }
    console.log(
      `☕ [API Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.data || "",
    );
    return config;
  },
  (error) => {
    console.error("❌ [API Request Error]", error);
    return Promise.reject(error);
  },
);

// LOG RESPONSE
axiosClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    console.log(`✅ [API Response] ${response.config.url}:`, res);

    const AUTH_ERROR_CODES = [
      "AUTHEN000",
      "AUTHEN001",
      "AUTHEN002",
      "AUTHEN003",
      "SYS010", // Session expired error code
    ];

    // Chỉ coi là lỗi nếu có res_code và res_code khác 0
    if (res && res.hasOwnProperty('res_code') && res.res_code !== 0) {
      const isAuthError = AUTH_ERROR_CODES.includes(res.error_code) || res.data?.message === "AUTHEN000";
      if (isAuthError) {
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
    const isNetworkError = !error.response; // Không có response = network/server down
    const isBackgroundCheck = url.includes('/auth/me');

    console.error(
      '❌ [API Response Error]',
      error.response?.data || error.message,
    );

    // Không show toast cho background auth check khi server không kết nối được
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
