/**
 * @file Config.ts
 * @desc Biến cấu hình ứng dụng — đọc từ react-native-config (.env),
 *       xuất APP_CONFIG (apiUrl, socketUrl, publicKey) và APP_ASSETS.
 * @layer constants
 */


export const APP_CONFIG = {
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Native Coffee',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.nativecoffee.com.vn',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || `${process.env.EXPO_PUBLIC_API_URL}/socket.io`,
  publicKey: process.env.EXPO_PUBLIC_PUBLIC_KEY ? process.env.EXPO_PUBLIC_PUBLIC_KEY.replace(/\\n/g, '\n').replace(/"/g, '') : '',
};

console.log('--- NATIVE COFFEE CONFIG ---');
console.log('API Base URL:', APP_CONFIG.apiUrl);
console.log('Full Login URL:', `${APP_CONFIG.apiUrl}/auth/login`);
console.log('Public Key Found:', !!APP_CONFIG.publicKey);

export const APP_ASSETS = {
  logo: require('@/assets/images/logo.png'),
  splashBg: require('@/assets/images/splash_bg.png'),
  coffeePattern: require('@/assets/images/coffee_pattern.png'),
};
