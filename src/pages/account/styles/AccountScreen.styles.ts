import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F6' },
  scrollContent: { paddingBottom: 40 },
  
  headerGradient: {
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold, fontSize: 18, color: '#FFF',
  },
  
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  avatarContainer: {
    width: 72, height: 72, borderRadius: 16,
    borderWidth: 2, borderColor: '#FFF',
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  avatar: { width: '100%', height: '100%' },
  nameContainer: { marginLeft: 16 },
  profileName: { fontFamily: FONTS.bold, fontSize: 20, color: '#FFF' },
  profileRole: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
  },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: 11, color: '#FFF' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -35,
  },
  statCard: {
    backgroundColor: '#FFF',
    width: '31%',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: { fontFamily: FONTS.bold, fontSize: 18, color: '#F97316' },
  statLabel: { fontFamily: FONTS.regular, fontSize: 10, color: '#9CA3AF', marginTop: 4 },

  menuSection: { paddingHorizontal: 16, marginTop: 32 },
  sectionTitle: {
    fontFamily: FONTS.bold, fontSize: 12, color: '#9CA3AF',
    marginBottom: 16, marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontFamily: FONTS.medium, fontSize: 15, color: '#1E293B' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 20,
    gap: 10,
    borderWidth: 1, borderColor: '#FEE2E2',
  },
  logoutText: { fontFamily: FONTS.bold, fontSize: 16, color: '#EF4444' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 20, color: '#111827', marginBottom: 6 },
  modalSub: { fontFamily: FONTS.regular, fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  btnCancelText: { fontFamily: FONTS.semiBold, fontSize: 15, color: '#374151' },
  btnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnConfirmText: { fontFamily: FONTS.bold, fontSize: 15, color: '#FFF' },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  langOptionActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA'
  },
  langText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: '#4B5563'
  },
  langTextActive: {
    fontFamily: FONTS.bold,
    color: '#F97316'
  }
});
