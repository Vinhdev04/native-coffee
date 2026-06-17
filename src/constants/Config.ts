/**
 * @file Config.ts
 * @desc Biến cấu hình ứng dụng — đọc từ react-native-config (.env),
 *       xuất APP_CONFIG (apiUrl, socketUrl, publicKey) và APP_ASSETS.
 * @layer constants
 */

export const APP_CONFIG = {
  appName: process.env.EXPO_PUBLIC_APP_NAME || "Chips Bill",
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
  version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL || "https://bill-dev.chips.com.vn/api",
  socketUrl:
    process.env.EXPO_PUBLIC_SOCKET_URL ||
    `${process.env.EXPO_PUBLIC_API_URL}/socket.io`,
  publicKey: process.env.EXPO_PUBLIC_PUBLIC_KEY
    ? process.env.EXPO_PUBLIC_PUBLIC_KEY.replace(/\\n/g, "\n").replace(/"/g, "")
    : "",
};

console.log('--- CẤU HÌNH Chips Bill ---');
console.log('Đường dẫn API gốc:', APP_CONFIG.apiUrl);
console.log('Đường dẫn đăng nhập đầy đủ:', `${APP_CONFIG.apiUrl}/auth/login`);
console.log('Tìm thấy khóa công khai:', !!APP_CONFIG.publicKey);

export const APP_ASSETS = {
  logo: require("@/assets/images/logo.png"),
  // Các file ảnh dưới đây chưa tồn tại trong thư mục src/assets/images nên tạm thời ẩn đi để tránh lỗi build
  // splashBg: require("@/assets/images/splash_bg.png"),
  // coffeePattern: require("@/assets/images/coffee_pattern.png"),
};
