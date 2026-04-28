/**
 * @file utils/index.ts
 * @desc Tích hợp các tiện ích cốt lõi — SCREEN_WIDTH/HEIGHT, isIOS,
 *       formatCurrency, generateCartId, truncateText, formatOrderCount.
 * @layer utils
 */

import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const isIOS     = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Format tiền VNĐ
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Tạo cartId duy nhất từ product + options
 */
export const generateCartId = (productId: string, size: string, sweetness: string, toppings: string[]): string => {
  const toppingKey = [...toppings].sort().join('-');
  return `${productId}_${size}_${sweetness}_${toppingKey}`;
};

/**
 * Rút gọn chuỗi văn bản
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format số lượng đơn hàng
 */
export const formatOrderCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};
