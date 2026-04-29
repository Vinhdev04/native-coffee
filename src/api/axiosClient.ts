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
import { getStoredToken } from "@/context/AuthContext";

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
    const token = await getStoredToken();
    const isPublic = config.url?.startsWith("/public/");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
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
    ];

    if (res && res.res_code !== 0) {
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
    console.error(
      "❌ [API Response Error]",
      error.response?.data || error.message,
    );
    const message =
      error.response?.data?.error_cont ||
      error.message ||
      "Kết nối máy chủ thất bại";
    Toast.show({
      type: "error",
      text1: "Lỗi kết nối",
      text2: message,
      position: "bottom",
    });
    return Promise.reject(error);
  },
);

export default axiosClient;
