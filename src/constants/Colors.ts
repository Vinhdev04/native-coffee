/**
 * @file Colors.ts
 * @desc Bảng màu thương hiệu Native Coffee — espresso, caramel,
 *       nền kem ấm và semantic colors (success, error, …).
 * @layer constants
 */
export const Colors = {
  // === BRAND ORANGE ===
  primary: '#FF7A00',          // Orange chính
  primaryLight: '#FF9E40',     // Orange nhạt
  primaryDark: '#E66A00',      // Orange đậm
  accent: '#111827',           // Text đen/xám tối cho nút
  accentLight: '#374151',      // Xám nhạt hơn
  gold: '#F59E0B',             // Vàng sao/badge

  // === SEMANTIC ===
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // === BACKGROUND ===
  background: '#F9FAFB',       // Nền xám rất nhạt
  backgroundSecondary: '#F3F4F6', // Nền xám nhạt
  surface: '#FFFFFF',          // Trắng
  surfaceWarm: '#FFF7F0',      // Trắng cam nhẹ

  // === TEXT ===
  textPrimary: '#111827',      // Chữ chính - đen
  textSecondary: '#4B5563',    // Chữ phụ - xám
  textMuted: '#9CA3AF',        // Chữ nhạt
  textOnDark: '#FFFFFF',       // Chữ trên nền tối
  textOnAccent: '#FFFFFF',     // Chữ trên nút

  // === BORDER & DIVIDER ===
  border: '#E5E7EB',           // Viền
  borderLight: '#F3F4F6',      // Viền nhạt
  divider: '#E5E7EB',          // Đường kẻ

  // === NEUTRAL ===
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // === OVERLAY ===
  overlay: 'rgba(0, 0, 0, 0.5)',     // Overlay tối
  overlayLight: 'rgba(0, 0, 0, 0.2)', // Overlay nhạt
  placeholder: '#D1D5DB',
};

export type ColorType = keyof typeof Colors;
