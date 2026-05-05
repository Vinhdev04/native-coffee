/**
 * @file OrderScreen.tsx
 * @desc Danh sách đơn hàng — tab Hiện tại / Lịch sử, navigate đến OrderDetail.
 * @layer pages/orders
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchOrders } from '@/services/orderService';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw } from 'lucide-react-native';

// ─── Status Config ──────────────────────────────────────────────────────────────
// ⚠️ API dùng field `orderStatus` (không phải `status`)
// Các giá trị: PENDING_PAYMENT, PAID, DONE, CANCELLED
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  DRAFT:           { label: 'Nháp',             color: '#6B7280', bg: '#F3F4F6', Icon: Clock },
  PENDING:         { label: 'Chờ xử lý',        color: '#92400E', bg: '#FEF3C7', Icon: Clock },
  PENDING_PAYMENT: { label: 'Chờ thanh toán',   color: '#92400E', bg: '#FEF3C7', Icon: Clock },
  PAID:            { label: 'Đã thanh toán',    color: '#065F46', bg: '#D1FAE5', Icon: CheckCircle },
  READY:           { label: 'Sẵn sàng',         color: '#1E40AF', bg: '#DBEAFE', Icon: CheckCircle },
  DONE:            { label: 'Hoàn thành',       color: '#374151', bg: '#F3F4F6', Icon: CheckCircle },
  CANCELLED:       { label: 'Đã hủy',           color: '#991B1B', bg: '#FEE2E2', Icon: XCircle },
  CANCEL:          { label: 'Đã hủy',           color: '#991B1B', bg: '#FEE2E2', Icon: XCircle },
};

// Hiện tại: chờ thanh toán, sẵn sàng
const CURRENT_STATUSES = ['PENDING', 'PENDING_PAYMENT', 'READY', 'DRAFT'];
// Lịch sử: đã thanh toán, hoàn thành, hủy
const HISTORY_STATUSES  = ['PAID', 'DONE', 'CANCELLED', 'CANCEL'];

const TABS = [
  { key: 'current', label: 'Hiện tại' },
  { key: 'history', label: 'Lịch sử' },
];

// ─── Helper ────────────────────────────────────────────────────────────────────
const formatDate = (raw: string) => {
  if (!raw) return 'Vừa xong';
  try {
    if (raw.length >= 12) {
      const y = raw.slice(0, 4), mo = raw.slice(4, 6), d = raw.slice(6, 8);
      const h = raw.slice(8, 10), mn = raw.slice(10, 12);
      return `${h}:${mn}  ${d}/${mo}/${y}`;
    }
    return raw;
  } catch { return raw; }
};

// ─── Component ─────────────────────────────────────────────────────────────────
const OrderScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [orders, setOrders]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log(`📋 [OrderScreen] render — tab=${activeTab}, orders=${orders.length}`);

  const loadOrders = useCallback(async () => {
    try {
      console.log(`📋 [OrderScreen] loadOrders → tab=${activeTab}`);
      setLoading(true);
      const res = await fetchOrders({ limit: 50 });
      console.log(`📋 [OrderScreen] raw response:`, JSON.stringify(res, null, 2));

      const all: any[] = (res as any)?.data?.rows
        || (res as any)?.data
        || (res as any)?.rows
        || res
        || [];

      // ✅ FIX: API trả về `orderStatus` không phải `status`
      console.log(`📋 [OrderScreen] total fetched: ${all.length}`);
      console.log(`📋 [OrderScreen] orderStatuses:`, all.map((o: any) => o.orderStatus));

      const filtered = all.filter((o: any) => {
        const st = o.orderStatus || o.status || '';
        return activeTab === 'current'
          ? CURRENT_STATUSES.includes(st)
          : HISTORY_STATUSES.includes(st);
      });
      console.log(`📋 [OrderScreen] filtered (${activeTab}): ${filtered.length}`);
      setOrders(filtered);
    } catch (err) {
      console.error('❌ [OrderScreen] loadOrders error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  // Reload khi focus vào tab
  useFocusEffect(useCallback(() => {
    loadOrders();
  }, [loadOrders]));

  const onRefresh = () => { setRefreshing(true); loadOrders(); };

  const renderOrder = ({ item }: { item: any }) => {
    // ✅ FIX: dùng orderStatus
    const statusKey = item.orderStatus || item.status || 'PENDING';
    const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING_PAYMENT;
    const StatusIcon = cfg.Icon;
    const itemCount  = item.items?.length || item.itemCount || 0;
    // ✅ FIX: totalAmount là string từ API → parseFloat
    const total = parseFloat(item.totalAmount || item.total || '0');

    console.log(`📦 [OrderScreen] renderOrder id=${item.id}, orderStatus=${statusKey}, total=${total}`);

    return (
      <TouchableOpacity
        style={s.orderCard}
        activeOpacity={0.88}
        onPress={() => {
          console.log(`🔍 [OrderScreen] navigate OrderDetail → orderId=${item.id}`);
          navigation.navigate('OrderDetail', { orderId: item.id });
        }}
      >
        {/* Top: ID + Status */}
        <View style={s.cardTop}>
          <View style={s.orderIdRow}>
            <View style={s.orderDot} />
            <Text style={s.orderId}>Đơn #{item.id}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <StatusIcon size={12} color={cfg.color} />
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Order Code */}
        {!!item.orderCode && (
          <Text style={s.orderCode}>#{item.orderCode}</Text>
        )}

        {/* Customer */}
        {!!item.customerName && (
          <Text style={s.customerName}>👤 {item.customerName}</Text>
        )}

        {/* Meta */}
        <View style={s.cardBody}>
          <View style={s.metaRow}>
            <Package size={13} color={COLORS.textMuted} />
            <Text style={s.metaText}>{itemCount} sản phẩm</Text>
            <Text style={s.metaDot}>•</Text>
            <Clock size={13} color={COLORS.textMuted} />
            <Text style={s.metaText}>{formatDate(item.createTime)}</Text>
          </View>
        </View>

        {/* Bottom: Total + Chi tiết */}
        <View style={s.cardBottom}>
          <Text style={s.orderTotal}>{formatCurrency(total)}</Text>
          <View style={s.detailBtn}>
            <Text style={s.detailBtnText}>Xem chi tiết</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </View>
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
            onPress={() => { setActiveTab(tab.key as 'current' | 'history'); }}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} onRefresh={onRefresh}
              tintColor={COLORS.primary} colors={[COLORS.primary]}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    backgroundColor: '#D8F1F3',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.textPrimary },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center',
  },

  tabsContainer: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 14, marginBottom: 16,
    backgroundColor: COLORS.white, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: '#EDEDED',
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  tabTextActive: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.white },

  list: { paddingHorizontal: 20, paddingBottom: 110 },

  orderCard: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F0',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  orderId: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  orderCode: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
  customerName: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  cardBody: { marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  metaDot: { color: COLORS.textMuted, fontSize: 12 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6',
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
