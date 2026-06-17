import { StyleSheet, Platform } from 'react-native';
import { FONTS } from '@/styles/theme';

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FEF9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  
  content: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  bannerIconBox: {
    width: 48, height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#9A3412', marginBottom: 4 },
  bannerDesc: { fontFamily: FONTS.regular, fontSize: 12, color: '#C2410C', lineHeight: 18 },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontFamily: FONTS.bold, fontSize: 11, color: '#6B7280', letterSpacing: 0.5 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingLeft: 16,
    height: 56,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 16,
  },
  eyeBtn: { padding: 16 },
  
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#F97316',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});
