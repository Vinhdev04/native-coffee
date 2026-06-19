import { StyleSheet, Platform } from 'react-native';
import { FONTS } from '@/styles/theme';
import { ThemeColors } from '@/context/ThemeContext';

export const makeSectionHeaderStyles = (c: ThemeColors) => StyleSheet.create({
  wrap: { backgroundColor: c.sectionBg, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: FONTS.bold, fontSize: 13, color: c.sectionTitle },
});

export const makeHomeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 10 : 14,
    backgroundColor: c.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: c.headerBorder,
  },
  headerLeft: { height: 38, width: 80, overflow: 'hidden' },
  headerLogo: { width: '100%', height: '100%' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FF7A00', borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: c.headerBg,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: '#FFFFFF' },

  // Active table banner
  activeBanner: {
    backgroundColor: c.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: c.primaryBorder,
  },
  activeBannerDot: {
    backgroundColor: '#FF7A00',
    width: 8, height: 8, borderRadius: 4, marginRight: 8,
  },
  activeBannerText: { fontSize: 13, fontFamily: FONTS.semiBold, color: '#FF7A00', flex: 1 },
  activeBannerBtn: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6,
    backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.primaryBorder,
  },
  activeBannerBtnText: { fontSize: 12, color: '#FF7A00', fontFamily: FONTS.medium },

  searchSection: { paddingBottom: 12, backgroundColor: c.headerBg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: c.searchBg,
    borderRadius: 14, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: c.searchBorder,
  },
  searchInput: { fontFamily: FONTS.medium, fontSize: 14, color: c.inputText, flex: 1 },

  catBar: {
    backgroundColor: c.headerBg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22,
    backgroundColor: c.chipBg,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: c.chipBgActive, borderColor: c.chipBgActive },
  catText: { fontFamily: FONTS.semiBold, fontSize: 13, color: c.chipText },
  catTextActive: { color: '#FFFFFF' },

  listContent: { backgroundColor: c.sectionBg, paddingBottom: 30 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: c.sectionBg },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: c.textMuted },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: c.sectionBg, paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: c.text },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: c.textMuted },
});

// Legacy exports for backward compat (used by SectionHeader)
export const sh = StyleSheet.create({
  wrap: { backgroundColor: '#F7F7F8', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151' },
});
export const s = makeHomeStyles({ bg: '#F8FAFC', bgSecondary: '#F1F5F9', surface: '#FFFFFF', card: '#FFFFFF', cardAlt: '#F9FAFB', text: '#111827', textSub: '#6B7280', textMuted: '#9CA3AF', textOnPrimary: '#FFFFFF', border: '#E5E7EB', borderLight: '#F3F4F6', divider: '#F0F0F0', tabBar: '#FFFFFF', tabBorder: '#F3F4F6', tabActive: '#FF7A00', tabInactive: '#9CA3AF', tabIconActiveBg: '#FFF7ED', headerBg: '#FFFFFF', headerBorder: '#F0F0F0', statusBar: 'dark-content', searchBg: '#F3F4F6', searchBorder: '#E5E7EB', inputText: '#111827', placeholder: '#9CA3AF', chipBg: '#F3F4F6', chipBgActive: '#FF7A00', chipText: '#6B7280', chipTextActive: '#FFFFFF', sectionBg: '#F7F7F8', sectionTitle: '#374151', primary: '#FF7A00', primaryLight: 'rgba(255,122,0,0.08)', primaryBorder: 'rgba(255,122,0,0.2)', success: '#10B981', successLight: 'rgba(16,185,129,0.12)', error: '#EF4444', errorLight: 'rgba(239,68,68,0.12)', warning: '#F59E0B', info: '#818CF8', infoLight: 'rgba(129,140,248,0.15)', overlay: 'rgba(0,0,0,0.65)', overlayLight: 'rgba(0,0,0,0.35)', modalBg: '#FFFFFF', modalBorder: '#E5E7EB', dragHandle: '#D1D5DB', btnCancel: '#F3F4F6', btnCancelText: '#374151' });
