import { StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    right: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },

  infoCard: {
    marginTop: -24,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.textPrimary, flex: 1, marginRight: 12 },
  productPrice: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },

  description: {
    fontFamily: FONTS.regular, fontSize: 14,
    color: COLORS.textSecondary, lineHeight: 22,
    marginBottom: 24,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 22 },

  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  badgeMulti: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badgeMultiText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.primary,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: '#FFF7ED' },
  chipActiveTopping: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  chipText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textSecondary },
  chipPrice: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.primary },

  noteInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary,
    minHeight: 46, textAlignVertical: 'top',
  },

  qtySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  qtyControls: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 50, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 4, paddingVertical: 4, gap: 4,
  },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  qtyBtnDisabled: { borderColor: '#F3F4F6' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, paddingHorizontal: 10, minWidth: 30, textAlign: 'center' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  footerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 20,
  },
  totalBlock: {},
  totalLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  totalPrice: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  addBtn: {
    flex: 1, height: 54, borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  addBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
});
