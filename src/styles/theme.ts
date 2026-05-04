/**
 * @file theme.ts
 * @desc Hằng số theme tổng hợp — COLORS (coffee palette), FONTS
 *       (BeVietnamPro), SPACING và BORDER_RADIUS dùng xử lý StyleSheet.
 * @layer styles
 */

export const COLORS = {
  // === BRAND ORANGE ===
  primary: '#FF7A00',        // Orange chính
  primaryLight: '#FF9E40',   // Orange nhạt
  primaryDark: '#E66A00',    // Orange đậm
  accent: '#111827',         // Đen xám cho text
  accentLight: '#374151',    // Xám
  gold: '#F59E0B',           // Vàng sao/badge

  // === SEMANTIC ===
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // === BACKGROUND ===
  background: '#F9FAFB',     // Nền nhạt
  surface: '#FFFFFF',
  surfaceWarm: '#FFF7F0',

  // === TEXT ===
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',

  // === NEUTRAL ===
  white: '#FFFFFF',
  black: '#111827',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  placeholder: '#D1D5DB',

  // === BACKGROUND ===
  backgroundSecondary: '#F3F4F6',

  // === GRAY SCALE ===
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

  // === COFFEE SPECIFIC (Kept for compatibility, but changed colors) ===
  coffee: {
    espresso: '#111827',
    americano: '#374151',
    latte: '#F3F4F6',
    cappuccino: '#D1D5DB',
    mocha: '#4B5563',
    cream: '#F9FAFB',
    milk: '#FFFFFF',
  },

  // === OVERLAY ===
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

export const FONTS = {
  bold:     'BeVietnamPro-Bold',
  semiBold: 'BeVietnamPro-SemiBold',
  medium:   'BeVietnamPro-Medium',
  regular:  'BeVietnamPro-Regular',
  light:    'BeVietnamPro-Light',
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};
