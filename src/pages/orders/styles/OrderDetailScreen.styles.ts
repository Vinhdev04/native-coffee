import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white,
  },
  headerBtn: { 
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#F9FAFB', borderRadius: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  headerRight: { width: 44 },
  scroll: { padding: 16 },
  
  statusCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  statusIconContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusText: { fontFamily: FONTS.bold, fontSize: 22, marginBottom: 4 },
  orderIdText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
  orderMetaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  metaDivider: { width: 1, height: 12, backgroundColor: '#E5E7EB', marginHorizontal: 12 },

  sectionCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, flex: 1 },
  itemCountBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  itemCountText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted },

  itemsList: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  itemMain: { flexDirection: 'row', flex: 1 },
  qtyCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  qtyCircleText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  itemAttr: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: '#FFF7ED', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  itemNote: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.primary },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary, marginLeft: 10 },

  paymentInfo: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentLabel: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  paymentValue: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  lineDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  totalValue: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },

  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 20, gap: 12, backgroundColor: COLORS.white,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  cancelBtn: { flex: 1, height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.error, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.error },
  payBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  payBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  emptyText: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textMuted, marginTop: 20 },
  backBtnLarge: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 12 },
  backBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.white },
});
