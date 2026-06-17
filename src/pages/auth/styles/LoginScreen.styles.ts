import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

const { width } = Dimensions.get('window');

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F5',
  },
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: width < 360 ? 16 : 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Role Selection
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  mainLogo: {
    width: width * 0.6,
    height: width < 360 ? 60 : 80,
    marginBottom: 10,
  },
  logoImg: {
    width: 32,
    height: 32,
  },
  brandName: {
    fontFamily: 'GreatVibes-Regular',
    fontSize: 38,
    fontWeight: '800',
    color: '#F7941D', // Vibrant Chips Orange
    marginBottom: 8,
    textShadowColor: 'rgba(247, 148, 29, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#8B7B71',
  },
  cardsWrapper: {
    width: '100%',
    gap: 14,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTextWrapper: {
    flex: 1,
    paddingHorizontal: 14,
  },
  roleTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  roleDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  roleArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBranding: {
    textAlign: 'center',
    marginTop: 48,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#B0A299',
  },

  // Login Form
  backBtn: {
    marginBottom: 20,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: width < 360 ? 16 : 28,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  formIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formRole: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  formTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 14,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    height: '100%',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 14,
    marginBottom: 28,
  },
  forgotPassText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
});
