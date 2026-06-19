import { COLORS, FONTS } from '@/styles/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 12) / 2;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },

  // ─── HEADER ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#0A0F1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.25)',
  },

  // ─── STATS BAR ─────────────────────────────────────────────────
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    marginTop: 14,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#131929',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTexts: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },

  // ─── FILTERS ───────────────────────────────────────────────────
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#131929',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  filterBtnActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  filterText: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  filterTextActive: {
    color: '#FFF',
    fontFamily: FONTS.bold,
  },

  // ─── LIST ──────────────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#475569',
    fontFamily: FONTS.medium,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // ─── CARD ──────────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardEmpty: {
    backgroundColor: '#131929',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardOccupied: {
    backgroundColor: '#16120A',
    borderColor: 'rgba(255, 122, 0, 0.35)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  badgeEmpty: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeOccupied: {
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.2,
  },
  tableNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  tableIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#F1F5F9',
    flex: 1,
    letterSpacing: 0.1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 6,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 3,
  },
  footerBtnOccupied: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.2)',
    gap: 3,
  },
  footerBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: FONTS.medium,
  },
  footerBtnTextOccupied: {
    fontSize: 11,
    color: '#FF7A00',
    fontFamily: FONTS.medium,
  },

  // ─── MODAL ─────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    paddingTop: 60,
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTableIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 28,
    fontFamily: FONTS.regular,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimary: {
    flexDirection: 'row',
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  modalBtnIcon: {
    // kept for compatibility
  },
  modalBtnTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  modalBtnSecondary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.2)',
    gap: 10,
  },
  modalBtnTextSecondary: {
    color: '#FF7A00',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },

  // ─── QR ────────────────────────────────────────────────────────
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrWrapper: {
    padding: 18,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  qrHint: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: FONTS.regular,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default s;