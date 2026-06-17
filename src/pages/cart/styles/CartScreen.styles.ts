import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

export const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  itemsSection: { backgroundColor: COLORS.white },
  cartItem: {
    flexDirection: 'row', padding: 10, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: Platform.OS === 'android' ? 10 : 15,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  headerBtn: { 
    width: 38, height: 38, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#F9FAFB', borderRadius: 12,
  },
  headerRight: { minWidth: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  image: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F9FAFB' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  itemAttributes: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  itemActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 2 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 8 },
  qtyText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, paddingHorizontal: 10 },
  noteBtn: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    flex: 1, marginRight: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E5E7EB'
  },
  noteBtnActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary, borderStyle: 'solid' },
  noteBtnText: { marginLeft: 4, fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted },

  voucherCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.white, marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  voucherIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center' },
  voucherTextContainer: { flex: 1, marginLeft: 12 },
  voucherTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  voucherSubtitle: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  
  vatCard: {
    backgroundColor: COLORS.white, padding: 16, marginTop: 8,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  vatHeader: { marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  vatTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, marginLeft: 8 },
  vatOptions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  vatOptionBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB'
  },
  vatOptionActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary },
  vatOptionText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  vatOptionTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  vatInputRow: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' 
  },
  vatInputLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textPrimary },
  vatInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12 },
  vatInput: {
    width: 40, height: 40,
    textAlign: 'center', fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary
  },
  vatPercentIcon: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted },
  vatFixedText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF0E6', borderRadius: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  deleteBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 200 },
  mainContainer: { flex: 1, paddingHorizontal: 20 },
  modalProductName: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, marginBottom: 15 },
  voucherList: { marginTop: 10 },
  voucherBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  voucherBadgeText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: COLORS.white, 
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  footerTotalLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  footerTotalValue: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },
  footerItemCount: { backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  footerItemCountText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textPrimary },
  checkoutBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  checkoutText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 10 },
  shopBtn: { marginTop: 30, backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 14 },
  shopBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  noteModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  noteInput: { 
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12, height: 100, 
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  saveNoteBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveNoteText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  voucherModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  voucherOption: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6'
  },
  voucherOptionActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary },
  voucherOptionInfo: { flex: 1 },
  voucherOptionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  voucherOptionValue: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.primary },
  removeVoucherBtn: { paddingVertical: 10, alignItems: 'center' },
  removeVoucherText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.error },
});
