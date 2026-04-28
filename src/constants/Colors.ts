/**
 * @file Colors.ts
 * @desc Bảng màu thương hiệu Native Coffee — espresso, caramel,
 *       nền kem ấm và semantic colors (success, error, …).
 * @layer constants
 */
export const Colors = {
  // === BRAND COFFEE ===
  primary: '#3D1C02',          // Espresso đậm - màu chủ đạo
  primaryLight: '#6B3A2A',     // Nâu medium roast
  primaryDark: '#1A0A00',      // Dark roast - header/footer
  accent: '#C8793A',           // Caramel ấm - nút CTA
  accentLight: '#E8A96A',      // Caramel nhạt - hover/highlight
  gold: '#D4A843',             // Vàng cà phê - badge, star

  // === SEMANTIC ===
  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  // === BACKGROUND ===
  background: '#FFF8F0',       // Kem ấm - nền chính
  backgroundSecondary: '#FFF3E8', // Kem đậm hơn
  surface: '#FFFFFF',          // Card/surface trắng
  surfaceWarm: '#FDF6EE',      // Surface ấm nhẹ

  // === TEXT ===
  textPrimary: '#1A0A00',      // Chữ chính - dark roast
  textSecondary: '#6B3A2A',    // Chữ phụ - medium roast
  textMuted: '#9CA3AF',        // Chữ nhạt - placeholder
  textOnDark: '#FFFFFF',       // Chữ trên nền tối
  textOnAccent: '#FFFFFF',     // Chữ trên nút caramel

  // === BORDER & DIVIDER ===
  border: '#E8D5C4',           // Viền ấm
  borderLight: '#F5EDE3',      // Viền nhạt
  divider: '#F0E0D0',          // Đường kẻ

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
  overlay: 'rgba(61, 28, 2, 0.5)',     // Overlay coffee tối
  overlayLight: 'rgba(61, 28, 2, 0.15)', // Overlay nhạt
  placeholder: '#D4B8A8',
};

export type ColorType = keyof typeof Colors;
