/**
 * @file Typography.ts
 * @desc Hằng số font chữ (BeVietnamPro) — fontFamily, fontSize và
 *       CommonStyles dùng nhanh cho Text components.
 * @layer constants
 */
export const Typography = {
  fontFamily: {
    regular: 'BeVietnamPro-Regular',
    bold: 'BeVietnamPro-Bold',
    medium: 'BeVietnamPro-Medium',
    semiBold: 'BeVietnamPro-SemiBold',
    light: 'BeVietnamPro-Light',
    italic: 'BeVietnamPro-Italic',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  },
} as const;

export const CommonStyles = {
  text: {
    fontFamily: Typography.fontFamily.regular,
    color: '#1A0A00',
  },
  textBold: {
    fontFamily: Typography.fontFamily.bold,
    color: '#1A0A00',
  },
  textMedium: {
    fontFamily: Typography.fontFamily.medium,
    color: '#1A0A00',
  },
  textSemiBold: {
    fontFamily: Typography.fontFamily.semiBold,
    color: '#1A0A00',
  },
};
