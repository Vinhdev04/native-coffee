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
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  statusIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statusText: { fontFamily: FONTS.bold, fontSize: 20, marginBottom: 4 },
  orderIdText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  orderMetaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: FONTS.medium, fontSize: 13, color: '#475569' },
  metaDivider: { width: 1, height: 12, backgroundColor: '#E2E8F0', marginHorizontal: 12 },

  sectionCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 12 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, flex: 1 },
  itemCountBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  itemCountText: { fontFamily: FONTS.bold, fontSize: 12, color: '#64748B' },

  itemsList: { paddingTop: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  itemMain: { flexDirection: 'row', flex: 1 },
  qtyCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  qtyCircleText: { fontFamily: FONTS.bold, fontSize: 13, color: '#EA580C' },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: FONTS.medium, fontSize: 15, color: '#334155' },
  itemAttr: { fontFamily: FONTS.regular, fontSize: 13, color: '#94A3B8', marginTop: 2 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: '#FFF7ED', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  itemNote: { fontFamily: FONTS.medium, fontSize: 11, color: '#EA580C' },
  itemPrice: { fontFamily: FONTS.semiBold, fontSize: 15, color: '#334155', marginLeft: 10 },

  paymentInfo: { paddingTop: 4 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentLabel: { fontFamily: FONTS.medium, fontSize: 14, color: '#64748B' },
  paymentValue: { fontFamily: FONTS.semiBold, fontSize: 14, color: '#334155' },
  lineDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 16, color: '#1E293B' },
  totalValue: { fontFamily: FONTS.bold, fontSize: 20, color: '#EA580C' },

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
