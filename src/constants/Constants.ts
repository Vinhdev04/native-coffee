/**
 * @file Constants.ts
 * @desc Hằng số layout dùng chung — header padding, border radius
 *       và shadow presets cho toàn bộ ứng dụng.
 * @layer constants
 */

export const Layout = {
  headerPaddingTop: 30,
  headerPaddingBottom: 12,
  headerPaddingHorizontal: 20,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: '#3D1C02',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#3D1C02',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#3D1C02',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
