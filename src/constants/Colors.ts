/**
 * @file Colors.ts
 * @desc Bảng màu thương hiệu Native Coffee — espresso, caramel,
 *       nền kem ấm và semantic colors (success, error, …).
 * @layer constants
 */
export const Colors = {
  // === BRAND COFFEE ===
  primary: '#23120B',          // Americano/Espresso đậm - màu chủ đạo
  primaryLight: '#4E342E',     // Nâu medium roast
  primaryDark: '#110905',      // Deep roast - header/footer
  accent: '#AF693E',           // Caramel đậm - nút CTA
  accentLight: '#D29168',      // Caramel nhạt - hover/highlight
  gold: '#C5A059',             // Vàng cà phê - badge, star

  // === SEMANTIC ===
  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  // === BACKGROUND ===
  background: '#FDF8F5',       // Kem rất nhạt - nền chính
  backgroundSecondary: '#F8F1EA', // Kem đậm hơn (Latte)
  surface: '#FFFFFF',          // Card/surface trắng
  surfaceWarm: '#FAF3ED',      // Surface ấm nhẹ

  // === TEXT ===
  textPrimary: '#23120B',      // Chữ chính - dark roast
  textSecondary: '#5D4037',    // Chữ phụ - medium roast
  textMuted: '#9E9E9E',        // Chữ nhạt - placeholder
  textOnDark: '#FFFFFF',       // Chữ trên nền tối
  textOnAccent: '#FFFFFF',     // Chữ trên nút caramel

  // === BORDER & DIVIDER ===
  border: '#E0D4CC',           // Viền ấm
  borderLight: '#F1E9E4',      // Viền nhạt
  divider: '#EDE0D4',          // Đường kẻ

  // === NEUTRAL ===
  white: '#FFFFFF',
  black: '#000000',
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

  // === OVERLAY ===
  overlay: 'rgba(35, 18, 11, 0.6)',     // Overlay coffee tối
  overlayLight: 'rgba(35, 18, 11, 0.15)', // Overlay nhạt
  placeholder: '#D2B4A3',
};

export type ColorType = keyof typeof Colors;
