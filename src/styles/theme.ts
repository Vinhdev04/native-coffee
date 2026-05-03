/**
 * @file theme.ts
 * @desc Hằng số theme tổng hợp — COLORS (coffee palette), FONTS
 *       (BeVietnamPro), SPACING và BORDER_RADIUS dùng xử lý StyleSheet.
 * @layer styles
 */

export const COLORS = {
  // === BRAND ===
  primary: '#23120B',        // Americano/Espresso đậm
  primaryLight: '#4E342E',   // Medium roast
  primaryDark: '#110905',    // Deep roast
  accent: '#AF693E',         // Caramel
  accentLight: '#D29168',    // Caramel nhạt
  gold: '#C5A059',           // Vàng cà phê

  // === SEMANTIC ===
  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#DC2626',

  // === BACKGROUND ===
  background: '#FDF8F5',     // Kem rất nhạt
  surface: '#FFFFFF',
  surfaceWarm: '#FAF3ED',

  // === TEXT ===
  textPrimary: '#23120B',
  textSecondary: '#5D4037',
  textMuted: '#9E9E9E',
  textOnDark: '#FFFFFF',

  // === NEUTRAL ===
  white: '#FFFFFF',
  black: '#110905',
  border: '#E0D4CC',
  borderLight: '#F3E9E2',
  divider: '#EDE0D4',
  placeholder: '#D2B4A3',

  // === BACKGROUND ===
  backgroundSecondary: '#F5F5F5',

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
    espresso: '#23120B',
    americano: '#4E342E',
    latte: '#D7CCC8',
    cappuccino: '#A1887F',
    mocha: '#5D4037',
    cream: '#FDF8F5',
    milk: '#F8F1EA',
  },

  // === OVERLAY ===
  overlay: 'rgba(35, 18, 11, 0.6)',
  overlayLight: 'rgba(35, 18, 11, 0.15)',
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
