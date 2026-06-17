import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

export const sh = StyleSheet.create({
  wrap: { backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827', letterSpacing: 0.3 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB', opacity: 0.6 },
});

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: Platform.OS === 'android' ? 10 : 15, 
    backgroundColor: COLORS.white,
  },
  headerLeft: { width: 44 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  headerBtn: { 
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#F9FAFB', borderRadius: 14,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  badge: { 
    position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, borderRadius: 10, 
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.white 
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: COLORS.white },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingBottom: 14 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#F3F4F6' },
  searchInput: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: '#374151' },

  catBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  catScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catIcon: { width: 18, height: 18, borderRadius: 9 },
  catText: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#6B7280' },
  catTextActive: { color: '#fff' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textSecondary },
});
