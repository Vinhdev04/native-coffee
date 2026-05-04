import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchOrders } from '@/services/orderService';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw } from 'lucide-react-native';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:   { label: 'Nháp',          color: '#6B7280', bg: '#F3F4F6', icon: <Clock size={12} color="#6B7280" /> },
  PENDING: { label: 'Chờ xử lý',     color: '#92400E', bg: '#FEF3C7', icon: <Clock size={12} color="#92400E" /> },
  PAID:    { label: 'Đã thanh toán', color: '#065F46', bg: '#D1FAE5', icon: <CheckCircle size={12} color="#065F46" /> },
  READY:   { label: 'Sẵn sàng',      color: '#1E40AF', bg: '#DBEAFE', icon: <CheckCircle size={12} color="#1E40AF" /> },
  DONE:    { label: 'Hoàn thành',    color: '#374151', bg: '#F3F4F6', icon: <CheckCircle size={12} color="#374151" /> },
  CANCEL:  { label: 'Đã hủy',        color: '#991B1B', bg: '#FEE2E2', icon: <XCircle size={12} color="#991B1B" /> },
};

const TABS = [
  { key: 'current', label: 'Hiện tại', dot: true },
  { key: 'history', label: 'Lịch sử',  dot: false },
];

const OrderScreen = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => { loadOrders(); }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({ limit: 50 });
      const all = res.data?.rows || res.data || [];
      const currentStatuses = ['PENDING', 'PAID', 'READY', 'DRAFT'];
      const historyStatuses  = ['DONE', 'CANCEL'];
      const filtered = all.filter((o: any) =>
        activeTab === 'current'
          ? currentStatuses.includes(o.status)
          : historyStatuses.includes(o.status)
      );
      setOrders(filtered);
    } catch (err) {
      console.error('[OrderScreen] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadOrders(); };

  const formatDate = (createTime: string) => {
    if (!createTime) return 'Vừa xong';
    try {
      const y = createTime.slice(0, 4);
      const m = createTime.slice(4, 6);
      const d = createTime.slice(6, 8);
      const h = createTime.slice(8, 10);
      const mn = createTime.slice(10, 12);
      return `${h}:${mn}  ${d}/${m}/${y}`;
    } catch {
      return createTime;
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    return (
      <TouchableOpacity style={s.orderCard} activeOpacity={0.88}>
        {/* Card Top: ID + Status */}
        <View style={s.cardTop}>
          <View style={s.orderIdRow}>
            <View style={s.orderDot} />
            <Text style={s.orderId}>Đơn #{item.id}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            {cfg.icon}
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={s.cardBody}>
          <View style={s.metaRow}>
            <Package size={13} color={COLORS.textMuted} />
            <Text style={s.metaText}>{item.items?.length || 0} sản phẩm</Text>
            <Text style={s.metaDot}>•</Text>
            <Clock size={13} color={COLORS.textMuted} />
            <Text style={s.metaText}>{formatDate(item.createTime)}</Text>
          </View>
        </View>

        {/* Card Bottom: Total + Detail */}
        <View style={s.cardBottom}>
          <Text style={s.orderTotal}>{formatCurrency(item.totalAmount || item.total)}</Text>
          <TouchableOpacity style={s.detailBtn}>
            <Text style={s.detailBtnText}>Xem chi tiết</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F1F3" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Đơn hàng</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key as 'current' | 'history')}
          >
            {tab.dot && (
              <View style={[s.tabDot, activeTab === tab.key && s.tabDotActive]} />
            )}
            {!tab.dot && activeTab === tab.key ? null : null}
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading */}
      {loading && !refreshing ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Package size={56} color="#E5E7EB" />
              <Text style={s.emptyTitle}>Chưa có đơn hàng nào</Text>
              <Text style={s.emptyText}>
                {activeTab === 'current' ? 'Bạn chưa có đơn hàng đang xử lý.' : 'Lịch sử đơn hàng trống.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    backgroundColor: '#D8F1F3',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.textPrimary },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },

  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1, borderColor: '#EDEDED',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  tabTextActive: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.white },
  tabDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' },
  tabDotActive: { backgroundColor: COLORS.white },

  list: { paddingHorizontal: 20, paddingBottom: 40 },

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  orderId: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 11 },

  cardBody: { marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  metaDot: { color: COLORS.textMuted, fontSize: 12 },

  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  orderTotal: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  detailBtnText: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.primary },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textSecondary },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});

export default OrderScreen;
