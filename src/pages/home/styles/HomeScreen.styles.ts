import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

export const sh = StyleSheet.create({
  wrap: { backgroundColor: '#F7F7F8', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151' },
});

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 10 : 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerLeft: { height: 38, width: 80, overflow: 'hidden' },
  headerLogo: { width: '100%', height: '100%' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  badge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.white,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: COLORS.white },

  activeBanner: {
    backgroundColor: '#FFF0E6', paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#FFE0CC',
  },
  activeBannerDot: { backgroundColor: COLORS.primary, width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  activeBannerText: { fontSize: 13, fontFamily: FONTS.semiBold, color: '#D44A00', flex: 1 },
  activeBannerBtn: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFE0CC',
  },
  activeBannerBtnText: { fontSize: 12, color: '#FF5500', fontFamily: FONTS.medium },

  searchSection: { paddingBottom: 12, backgroundColor: COLORS.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  searchInput: { fontFamily: FONTS.medium, fontSize: 14, color: '#111827', flex: 1 },

  catBar: {
    backgroundColor: '#fff', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#6B7280' },
  catTextActive: { color: '#fff' },

  listContent: { backgroundColor: '#F7F7F8', paddingBottom: 30 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F7F7F8' },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: '#9CA3AF' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#F7F7F8', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: '#374151' },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: '#9CA3AF' },
});
