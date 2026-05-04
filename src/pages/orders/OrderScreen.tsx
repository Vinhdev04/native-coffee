/**
 * @file OrderScreen.tsx
 * @desc Màn hình quản lý đơn hàng — hiển thị danh sách đơn hàng đã đặt,
 *       phân loại theo trạng thái (Đang chờ, Hoàn thành, Đã hủy).
 * @layer pages/orders
 */

import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { useCart }        from '@/context/CartContext';
import { formatCurrency } from '@/utils';

import { fetchOrders } from '@/services/orderService';
import { ActivityIndicator, RefreshControl } from 'react-native';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Nháp',       color: '#6B7280', bg: '#F3F4F6' },
  PENDING:   { label: 'Chờ xử lý',  color: '#92400E', bg: '#FEF3C7' },
  PAID:      { label: 'Đã thanh toán', color: '#065F46', bg: '#D1FAE5' },
  READY:     { label: 'Sẵn sàng',   color: '#1E40AF', bg: '#DBEAFE' },
  DONE:      { label: 'Hoàn thành', color: '#374151', bg: '#F3F4F6' },
  CANCEL:    { label: 'Đã hủy',     color: '#991B1B', bg: '#FEE2E2' },
};

const OrderScreen = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({ 
        limit: 50,
      });
      setOrders(res.data?.rows || res.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrder = ({ item }: { item: any }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const dateStr = item.createTime 
      ? `${item.createTime.slice(6,8)}/${item.createTime.slice(4,6)}/${item.createTime.slice(0,4)}`
      : 'Vừa xong';

    return (
      <TouchableOpacity style={s.orderCard} activeOpacity={0.8}>
        <View style={s.orderHeader}>
          <Text style={s.orderId}>#{item.id}</Text>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={s.orderBody}>
          <Text style={s.orderMeta}>☕ {item.items?.length || 0} sản phẩm  •  {dateStr}</Text>
          <Text style={s.orderTotal}>{formatCurrency(item.totalAmount || item.total)}</Text>
        </View>
        <TouchableOpacity style={s.detailBtn}>
          <Text style={s.detailBtnText}>Xem chi tiết →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Đơn hàng</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['current', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'current' ? '🔴 Hiện tại' : '📋 Lịch sử'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>☕</Text>
              <Text style={s.emptyText}>Chưa có đơn hàng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle:  { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },
  tabs:         { flexDirection: 'row', marginHorizontal: SPACING.md, backgroundColor: COLORS.white, borderRadius: 12, padding: 4, marginBottom: SPACING.sm },
  tab:          { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive:    { backgroundColor: COLORS.primary },
  tabText:      { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  tabTextActive:{ fontFamily: FONTS.bold, fontSize: 13, color: COLORS.white },
  list:         { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  orderCard:    { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2 },
  orderHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId:      { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.primary },
  statusBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontFamily: FONTS.semiBold, fontSize: 11 },
  orderBody:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderMeta:    { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  orderTotal:   { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.accent },
  detailBtn:    { alignSelf: 'flex-end' },
  detailBtnText:{ fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.accent },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyIcon:    { fontSize: 48 },
  emptyText:    { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
});

export default OrderScreen;
