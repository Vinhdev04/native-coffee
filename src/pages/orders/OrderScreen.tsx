import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '~/styles/theme';
import { useCart }        from '~/context/CartContext';
import { formatCurrency } from '~/utils';

const mockOrders = [
  { id: 'ORD-001', items: 3, total: 165000, status: 'completed', date: '28/04/2025 09:30' },
  { id: 'ORD-002', items: 1, total: 55000,  status: 'preparing', date: '28/04/2025 10:15' },
  { id: 'ORD-003', items: 2, total: 108000, status: 'pending',   date: '28/04/2025 11:00' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Chờ xử lý',  color: '#92400E', bg: '#FEF3C7' },
  preparing: { label: 'Đang pha',   color: '#1E40AF', bg: '#DBEAFE' },
  ready:     { label: 'Sẵn sàng',   color: '#065F46', bg: '#D1FAE5' },
  completed: { label: 'Hoàn thành', color: '#374151', bg: '#F3F4F6' },
  cancelled: { label: 'Đã hủy',     color: '#991B1B', bg: '#FEE2E2' },
};

const OrderScreen = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const renderOrder = ({ item }: { item: typeof mockOrders[0] }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <TouchableOpacity style={s.orderCard} activeOpacity={0.8}>
        <View style={s.orderHeader}>
          <Text style={s.orderId}>{item.id}</Text>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={s.orderBody}>
          <Text style={s.orderMeta}>☕ {item.items} sản phẩm  •  {item.date}</Text>
          <Text style={s.orderTotal}>{formatCurrency(item.total)}</Text>
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

      <FlatList
        data={mockOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>☕</Text>
            <Text style={s.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
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
  emptyText:    { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
});

export default OrderScreen;
