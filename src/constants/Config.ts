/**
 * @file Config.ts
 * @desc Biến cấu hình ứng dụng — đọc từ react-native-config (.env),
 *       xuất APP_CONFIG (apiUrl, socketUrl, publicKey) và APP_ASSETS.
 * @layer constants
 */

import Config from 'react-native-config';

export const APP_CONFIG = {
  appName: Config.APP_NAME || 'Native Coffee',
  appVersion: Config.APP_VERSION || '1.0.0',
  version: Config.APP_VERSION || '1.0.0',
  apiUrl: Config.API_URL || 'https://api.nativecoffee.com.vn',
  socketUrl: Config.SOCKET_URL || 'https://api.nativecoffee.com.vn/socket.io',
  publicKey: Config.PUBLIC_KEY ? Config.PUBLIC_KEY.replace(/\\n/g, '\n').replace(/"/g, '') : '',
};

console.log('--- NATIVE COFFEE CONFIG ---');
console.log('API URL:', APP_CONFIG.apiUrl);
console.log('Public Key Found:', !!APP_CONFIG.publicKey);

export const APP_ASSETS = {
  logo: require('@/assets/images/logo.png'),
  splashBg: require('@/assets/images/splash_bg.png'),
  coffeePattern: require('@/assets/images/coffee_pattern.png'),
};
