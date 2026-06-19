import { StyleSheet, Platform } from 'react-native';
import { FONTS } from '@/styles/theme';
import { ThemeColors } from '@/context/ThemeContext';

export const makeMenuStyles = (c: ThemeColors) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: c.bg },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: c.bg },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: c.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 10 : 14,
    backgroundColor: c.headerBg,
    borderBottomWidth: 1, borderBottomColor: c.headerBorder,
  },
  headerLeft:  { width: 44 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: c.text, flex: 1, textAlign: 'center' },
  headerBtn: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.border,
  },
  badge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#FF7A00', borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: c.headerBg,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: '#FFFFFF' },

  activeBanner: {
    backgroundColor: c.primaryLight, paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: c.primaryBorder,
  },
  activeBannerText: { fontSize: 13, fontFamily: FONTS.semiBold, color: '#FF7A00', flex: 1, marginLeft: 8 },
  activeBannerBtn: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.primaryBorder,
  },
  activeBannerBtnText: { fontSize: 12, color: '#FF7A00', fontFamily: FONTS.medium },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.headerBg, paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: c.borderLight,
  },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: c.searchBg, borderRadius: 14, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: c.searchBorder,
  },
  searchInput: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: c.inputText },

  catBar:       { backgroundColor: c.headerBg, borderBottomWidth: 1, borderBottomColor: c.borderLight },
  catScroll:    { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: c.chipBg, borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: c.chipBgActive, borderColor: c.chipBgActive },
  catIcon:      { width: 18, height: 18, borderRadius: 9 },
  catText:      { fontFamily: FONTS.semiBold, fontSize: 13, color: c.chipText },
  catTextActive:{ color: '#FFFFFF' },

  sectionHeader: {
    backgroundColor: c.sectionBg, paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: c.sectionTitle, letterSpacing: 0.3 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: c.divider },

  emptyWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: c.textSub },
});
