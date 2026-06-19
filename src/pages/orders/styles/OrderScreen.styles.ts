import { StyleSheet, Platform } from 'react-native';
import { FONTS } from '@/styles/theme';
import { ThemeColors } from '@/context/ThemeContext';

export const makeOrderStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 12,
    paddingBottom: 16,
    backgroundColor: c.headerBg,
    borderBottomWidth: 1, borderBottomColor: c.headerBorder,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22, color: c.text },
  headerSub: { fontFamily: FONTS.regular, fontSize: 12, color: c.textMuted, marginTop: 2 },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: c.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: c.border,
  },

  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 14, marginBottom: 4 },
  summaryCardOrange: { flex: 1, backgroundColor: '#FF7A00', borderRadius: 20, padding: 16 },
  summaryCardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  summaryCardLabel: { fontFamily: FONTS.medium, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  summaryCardAmount: { fontFamily: FONTS.bold, fontSize: 20, color: '#fff', marginBottom: 4 },
  summaryCardSub: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  summaryCardRight: {
    flex: 1, backgroundColor: c.card, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: c.border,
  },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  completionLabel: { fontFamily: FONTS.medium, fontSize: 12, color: c.textMuted },
  completionPct: { fontFamily: FONTS.bold, fontSize: 26, color: c.text },
  completionSub: { fontFamily: FONTS.regular, fontSize: 12, color: c.textMuted, marginTop: 2 },

  tabsWrap: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14, marginBottom: 10,
    backgroundColor: c.card, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: c.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: '#FF7A00' },
  tabText: { fontFamily: FONTS.medium, fontSize: 13, color: c.textMuted },
  tabTextActive: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#fff' },
  tabIndicator: { display: 'none' },

  list: { paddingHorizontal: 16, paddingBottom: 110 },

  orderCard: {
    backgroundColor: c.card, borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: c.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  orderId: { fontFamily: FONTS.bold, fontSize: 15, color: c.text },
  orderTime: { fontFamily: FONTS.regular, fontSize: 11, color: c.textMuted, marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  itemPreview: { fontFamily: FONTS.regular, fontSize: 13, color: c.textMuted, marginBottom: 10 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: c.divider,
  },
  itemCountText: { fontFamily: FONTS.regular, fontSize: 12, color: c.textMuted },
  orderTotal: { fontFamily: FONTS.bold, fontSize: 17, color: '#FF7A00' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: c.textMuted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: c.textSub },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: c.textMuted, textAlign: 'center' },
});

export const makeBottomSheetStyles = (c: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },
  sheet: {
    backgroundColor: c.modalBg,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24, paddingTop: 8,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: c.modalBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: c.dragHandle, alignSelf: 'center', marginBottom: 12,
  },

  headerContainer: { paddingHorizontal: 20, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIdRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  orderIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: c.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  orderCode: { fontFamily: FONTS.bold, fontSize: 18, color: c.text },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: c.btnCancel, justifyContent: 'center', alignItems: 'center',
  },

  headerInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginTop: 16, padding: 12, backgroundColor: c.cardAlt, borderRadius: 16,
  },
  headerInfoText: { flex: 1 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderTime: { fontFamily: FONTS.medium, fontSize: 13, color: c.textMuted },

  printActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF7A00', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, elevation: 3,
  },
  printActionText: { fontFamily: FONTS.bold, fontSize: 13, color: '#FFFFFF' },

  sectionTitle: {
    fontFamily: FONTS.bold, fontSize: 12, color: c.text,
    letterSpacing: 0.5, marginBottom: 12, paddingHorizontal: 20,
  },
  emptyItems: { fontFamily: FONTS.regular, fontSize: 13, color: c.textMuted, textAlign: 'center', paddingVertical: 16 },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 12, marginHorizontal: 20 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: c.divider },
  qtyBadge: { width: 26, height: 26, borderRadius: 8, backgroundColor: c.primaryLight, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 13, color: '#FF7A00' },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 14, color: c.text },
  itemAttr: { fontFamily: FONTS.regular, fontSize: 10, color: c.textMuted, marginTop: 1 },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 14, color: c.text },

  summaryBox: { marginTop: 12, backgroundColor: c.cardAlt, borderRadius: 14, padding: 14, marginHorizontal: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontFamily: FONTS.regular, fontSize: 13, color: c.textMuted },
  summaryValue: { fontFamily: FONTS.medium, fontSize: 13, color: c.text },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15, color: c.text },
  totalValue: { fontFamily: FONTS.bold, fontSize: 18, color: '#FF7A00' },

  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FF7A00', height: 54, borderRadius: 16,
    marginTop: 14, marginHorizontal: 20, elevation: 4,
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  payBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },

  qrContainer: {
    marginTop: 16, alignItems: 'center', padding: 16, marginHorizontal: 20,
    backgroundColor: c.cardAlt, borderRadius: 16, borderWidth: 1, borderColor: c.border,
  },
  qrWrapper: {
    padding: 10, backgroundColor: '#fff', borderRadius: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  qrInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  qrText: { fontFamily: FONTS.medium, fontSize: 13, color: c.textMuted },
});
