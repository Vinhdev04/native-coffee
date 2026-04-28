/**
 * @file theme.ts
 * @desc Hằng số theme tổng hợp — COLORS (coffee palette), FONTS
 *       (BeVietnamPro), SPACING và BORDER_RADIUS dùng xử lý StyleSheet.
 * @layer styles
 */

export const COLORS = {
  // === BRAND ===
  primary: '#3D1C02',        // Espresso đậm
  primaryLight: '#6B3A2A',   // Medium roast
  primaryDark: '#1A0A00',    // Dark roast
  accent: '#C8793A',         // Caramel
  accentLight: '#E8A96A',    // Caramel nhạt
  gold: '#D4A843',           // Vàng cà phê

  // === SEMANTIC ===
  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#DC2626',

  // === BACKGROUND ===
  background: '#FFF8F0',     // Kem ấm
  surface: '#FFFFFF',
  surfaceWarm: '#FDF6EE',

  // === TEXT ===
  textPrimary: '#1A0A00',
  textSecondary: '#6B3A2A',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',

  // === NEUTRAL ===
  white: '#FFFFFF',
  black: '#1A0A00',
  border: '#E8D5C4',
  divider: '#F0E0D0',
  placeholder: '#D4B8A8',

  // === GRAY SCALE ===
  gray: {
    50:  '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // === COFFEE SPECIFIC ===
  coffee: {
    espresso: '#3D1C02',
    americano: '#5C2E0A',
    latte: '#C8A882',
    cappuccino: '#9B6B47',
    mocha: '#6B3A2A',
    cream: '#FFF8F0',
    milk: '#FDF6EE',
  },

  // === OVERLAY ===
  overlay: 'rgba(61, 28, 2, 0.5)',
  overlayLight: 'rgba(61, 28, 2, 0.15)',
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
