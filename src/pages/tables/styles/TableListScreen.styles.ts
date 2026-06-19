import { COLORS, FONTS } from '@/styles/theme';
import { Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');
 const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Theme bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Orange tint
    borderRadius: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  filterTextActive: {
    color: '#FFF',
    fontFamily: FONTS.bold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontFamily: FONTS.medium,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: (width - 48) / 2, // 2 columns with spacing
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardEmpty: {
    borderColor: '#334155',
  },
  cardOccupied: {
    borderColor: '#475569',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEmpty: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgeOccupied: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  tableName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#F8FAFC',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnRight: {
    borderLeftWidth: 1,
    borderLeftColor: '#1E293B',
  },
  footerBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: FONTS.medium,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  modalBtnPrimary: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalBtnIcon: {
    marginRight: 8,
  },
  modalBtnTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  modalBtnSecondary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalBtnTextSecondary: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  qrHint: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: FONTS.medium,
    marginBottom: 24,
    textAlign: 'center',
  },
 });

export default s;