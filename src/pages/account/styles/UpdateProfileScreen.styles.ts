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
  
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 32 },
  avatarWrap: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  profileEmail: { fontFamily: FONTS.regular, fontSize: 14, color: '#6B7280' },

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
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF', marginLeft: 8 },
});
