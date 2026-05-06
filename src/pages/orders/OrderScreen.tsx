/**
 * @file OrderScreen.tsx
 * @desc Danh sách đơn hàng — 3 tabs (Tất cả / Đang chờ / Hoàn thành),
 *       summary card, bottom sheet chi tiết đơn.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
  Modal, ScrollView, Animated, Dimensions, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchOrders, fetchOrderById } from '@/services/orderService';
import {
  Package, Clock, CheckCircle, XCircle, ChevronRight,
  RefreshCw, Receipt, CreditCard, AlertTriangle, X, QrCode, ScanLine
} from 'lucide-react-native';
import { orderCache } from '@/utils/orderCache';
import QRCode from 'react-native-qrcode-svg';

const { height: SH } = Dimensions.get('window');

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  DRAFT:           { label: 'Nháp',           color: '#6B7280', bg: '#F3F4F6', Icon: Clock },
  PENDING:         { label: 'Đang chờ',       color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  PAID:            { label: 'Đã thanh toán',  color: '#059669', bg: '#D1FAE5', Icon: CheckCircle },
  READY:           { label: 'Sẵn sàng',       color: '#2563EB', bg: '#DBEAFE', Icon: CheckCircle },
  DONE:            { label: 'Hoàn thành',     color: '#059669', bg: '#D1FAE5', Icon: CheckCircle },
  CANCELLED:       { label: 'Đã hủy',         color: '#DC2626', bg: '#FEE2E2', Icon: XCircle },
  CANCEL:          { label: 'Đã hủy',         color: '#DC2626', bg: '#FEE2E2', Icon: XCircle },
};

const PENDING_STATUSES  = ['PENDING', 'PENDING_PAYMENT', 'READY', 'DRAFT'];
const DONE_STATUSES     = ['PAID', 'DONE'];
const CANCEL_STATUSES   = ['CANCELLED', 'CANCEL'];

const TABS = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'pending', label: 'Đang chờ' },
  { key: 'done',    label: 'Hoàn thành' },
];

const formatDate = (raw: string) => {
  if (!raw) return 'Vừa xong';
  try {
    if (raw.length >= 12) {
      const h = raw.slice(8, 10), mn = raw.slice(10, 12);
      const d = raw.slice(6, 8), mo = raw.slice(4, 6);
      return `${h}:${mn}  ${d}/${mo}`;
    }
    return raw;
  } catch { return raw; }
};

const formatDateTime = (raw: string) => {
  if (!raw) return '—';
  try {
    if (raw.length >= 12) {
      const y = raw.slice(0, 4), m = raw.slice(4, 6), d = raw.slice(6, 8);
      const h = raw.slice(8, 10), mn = raw.slice(10, 12);
      return `${h}:${mn} • ${d}/${m}/${y}`;
    }
    return raw;
  } catch { return raw; }
};

// ─── Bottom Sheet Component ───────────────────────────────────────────────────
const OrderBottomSheet = ({ order, onClose, onPayment }: { order: any; onClose: () => void; onPayment: () => void }) => {
  if (!order) return null;
  const statusKey = order.orderStatus || order.status || 'PENDING';
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING_PAYMENT;
  const items: any[] = order.items || order.orderItems || [];
  const total = parseFloat(order.totalAmount || order.total || '0');
  const canPay = PENDING_STATUSES.includes(statusKey);
  const paymentMethod = order.paymentMethod || order.payments?.[0]?.provider || null;

  return (
    <View style={bs.overlay}>
      <TouchableOpacity style={bs.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={bs.sheet}>
        {/* Handle */}
        <View style={bs.handle} />

        {/* Header */}
        <View style={bs.header}>
          <View style={bs.headerLeft}>
            <View style={bs.orderIcon}>
              <Receipt size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={bs.orderCode}>{order.orderCode || `#${order.id}`}</Text>
              <Text style={bs.orderTime}>{formatDateTime(order.createTime)} · {order.customerName || 'Khách'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[bs.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[bs.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={bs.closeBtn}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SH * 0.45 }}>
          {/* Items */}
          <Text style={bs.sectionTitle}>CHI TIẾT MÓN</Text>
          {items.length === 0 ? (
            <Text style={bs.emptyItems}>Không có sản phẩm</Text>
          ) : items.map((item: any, idx: number) => {
            const name = item.productNameSnapshot || item.productName || item.name || `Món #${idx + 1}`;
            const qty = item.qty || item.quantity || 1;
            const lineTotal = parseFloat(item.lineTotal || item.unitPriceSnapshot || '0');
            const attrs: any[] = item.selectedOptionsSnapshot || item.selectedAttributes || [];
            const attrStr = attrs.map((a: any) => a.name || a.attributeName).filter(Boolean).join(', ');
            return (
              <View key={item.id || idx} style={[bs.itemRow, idx < items.length - 1 && bs.itemBorder]}>
                <View style={bs.qtyBadge}><Text style={bs.qtyText}>{qty}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={bs.itemName}>{name}</Text>
                  {!!attrStr && <Text style={bs.itemAttr}>{attrStr}</Text>}
                </View>
                <Text style={bs.itemPrice}>{formatCurrency(lineTotal)}</Text>
              </View>
            );
          })}

          {/* Summary */}
          <View style={bs.summaryBox}>
            <View style={bs.summaryRow}>
              <Text style={bs.summaryLabel}>Tổng món</Text>
              <Text style={bs.summaryValue}>{items.length} món</Text>
            </View>
            {!!paymentMethod && (
              <View style={bs.summaryRow}>
                <Text style={bs.summaryLabel}>Thanh toán</Text>
                <Text style={bs.summaryValue}>{paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod}</Text>
              </View>
            )}
            <View style={[bs.summaryRow, { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' }]}>
              <Text style={bs.totalLabel}>Tổng cộng</Text>
              <Text style={bs.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* QR Code Section for Paid Orders */}
        {!canPay && (
          <View style={bs.qrContainer}>
            <View style={bs.qrWrapper}>
              <QRCode
                value={JSON.stringify({ action: 'view_order', orderId: order.id })}
                size={120}
                color={COLORS.textPrimary}
                backgroundColor="transparent"
              />
            </View>
            <View style={bs.qrInfo}>
              <QrCode size={16} color={COLORS.textMuted} />
              <Text style={bs.qrText}>Quét để xem chi tiết</Text>
            </View>
          </View>
        )}

        {/* CTA */}
        {canPay && (
          <TouchableOpacity style={bs.payBtn} onPress={onPayment}>
            <CreditCard size={18} color="#fff" />
            <Text style={bs.payBtnText}>Thanh toán ngay</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'done'>('all');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({ limit: 100 });
      const all: any[] = (res as any)?.data?.rows || (res as any)?.data || (res as any)?.rows || res || [];
      // Merge cache toàn cục vào orders mới load
      const globalCache = orderCache.getAll();
      const merged = all.map((o: any) => {
        const cached = globalCache[o.id];
        return cached !== undefined ? { ...o, itemCount: cached } : o;
      });
      setAllOrders(merged);

      if (merged.length > 0) {
        console.log('🔍 [OrderScreen] First order data:', JSON.stringify(merged[0], null, 2));
      }

    } catch (err) {
      console.error('❌ [OrderScreen] loadOrders error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const onRefresh = () => { setRefreshing(true); loadOrders(); };

  const filteredOrders = allOrders.filter((o: any) => {
    const st = o.orderStatus || o.status || '';
    if (activeTab === 'pending') return PENDING_STATUSES.includes(st);
    if (activeTab === 'done') return [...DONE_STATUSES, ...CANCEL_STATUSES].includes(st);
    return true;
  });

  // Summary stats (today)
  const todayOrders = allOrders.filter((o: any) => {
    if (!o.createTime) return false;
    const today = new Date();
    const d = o.createTime.slice(6, 8), mo = o.createTime.slice(4, 6), y = o.createTime.slice(0, 4);
    return (
      parseInt(d) === today.getDate() &&
      parseInt(mo) === today.getMonth() + 1 &&
      parseInt(y) === today.getFullYear()
    );
  });
  const todayTotal = todayOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || '0'), 0);
  const doneCount = allOrders.filter((o: any) => DONE_STATUSES.includes(o.orderStatus || o.status || '')).length;
  const completionPct = allOrders.length > 0 ? Math.round((doneCount / allOrders.length) * 100) : 0;

  const handleOrderPress = async (item: any) => {
    try {
      setSheetLoading(true);
      setSelectedOrder(item);
      const res = await fetchOrderById(item.id);
      const detail = (res as any)?.data ?? res;
      setSelectedOrder(detail);
      // Lưu vào cache và cập nhật list ngay lập tức
      if (detail?.items) {
        const count = detail.items.length;
        orderCache.setCount(item.id, count);
        setAllOrders(prev => prev.map(o =>
          o.id === item.id ? { ...o, itemCount: count } : o
        ));
      }

    } catch {
      setSelectedOrder(item);
    } finally {
      setSheetLoading(false);
    }
  };

  const handlePayment = () => {
    if (!selectedOrder) return;
    const total = parseFloat(selectedOrder.totalAmount || selectedOrder.total || '0');
    setSelectedOrder(null);
    navigation.navigate('Payment', {
      orderId: selectedOrder.id,
      totalAmount: total,
      customerName: selectedOrder.customerName,
    });
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusKey = item.orderStatus || item.status || 'PENDING';
    const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING_PAYMENT;
    const StatusIcon = cfg.Icon;
    const items: any[] = item.items || item.orderItems || [];
    const total = parseFloat(item.totalAmount || item.total || '0');
    const previewName = items[0]?.productNameSnapshot || items[0]?.productName || items[0]?.name || item.customerName || '';
    // API danh sách trả về số món qua nhiều tên field khác nhau
    const rawCount = item.itemCount ?? item.totalItems ?? item.item_count ?? item.total_items ?? null;
    const itemCount = rawCount !== null ? rawCount : items.length;
    const itemCountLabel = itemCount > 0 ? `${itemCount} món` : (items.length === 0 ? '— món' : '0 món');

    return (
      <TouchableOpacity style={s.orderCard} activeOpacity={0.88} onPress={() => handleOrderPress(item)}>
        <View style={s.cardTop}>
          <View style={s.orderIdRow}>
            <View style={s.orderIcon}>
              <Receipt size={15} color={COLORS.primary} />
            </View>
            <View>
              <Text style={s.orderId}>{item.orderCode || `#${item.id}`}</Text>
              <Text style={s.orderTime}>{formatDate(item.createTime)}</Text>
            </View>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <StatusIcon size={11} color={cfg.color} />
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {!!previewName && (
          <Text style={s.itemPreview} numberOfLines={1}>
            {itemCount > 0 ? `${itemCount > 1 ? `${itemCount}x ` : ''}${previewName}` : previewName}
            {itemCount > 1 && items.length > 1 ? ` và ${items.length - 1} món khác` : ''}
          </Text>
        )}

        <View style={s.cardBottom}>
          <Text style={s.itemCountText}>{itemCountLabel}</Text>
          <Text style={s.orderTotal}>{formatCurrency(total)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Bill Chips</Text>
          <Text style={s.headerSub}>Quản lý đơn hàng ({allOrders.length})</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={s.refreshBtn} onPress={() => navigation.navigate('ScanQR')}>
            <ScanLine size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Card */}
      <View style={s.summaryRow}>
        <View style={s.summaryCardOrange}>
          <View style={s.summaryCardTopRow}>
            <Clock size={14} color="rgba(255,255,255,0.8)" />
            <Text style={s.summaryCardLabel}>Hôm nay</Text>
          </View>
          <Text style={s.summaryCardAmount}>{formatCurrency(todayTotal)}</Text>
          <Text style={s.summaryCardSub}>{todayOrders.length} đơn</Text>
        </View>
        <View style={s.summaryCardRight}>
          <View style={s.completionRow}>
            <CheckCircle size={14} color={COLORS.success} />
            <Text style={s.completionLabel}>Hoàn thành</Text>
          </View>
          <Text style={s.completionPct}>{completionPct}%</Text>
          <Text style={s.completionSub}>{doneCount}/{allOrders.length} đơn</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsWrap}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
            {activeTab === tab.key && <View style={s.tabIndicator} />}
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
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={COLORS.primary} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Package size={60} color="#E5E7EB" />
              <Text style={s.emptyTitle}>Không có đơn nào</Text>
              <Text style={s.emptyText}>
                {activeTab === 'pending' ? 'Không có đơn đang chờ.' : activeTab === 'done' ? 'Chưa có đơn hoàn thành.' : 'Chưa có đơn hàng nào.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Bottom Sheet */}
      <Modal visible={!!selectedOrder} transparent animationType="slide" onRequestClose={() => setSelectedOrder(null)}>
        {sheetLoading && selectedOrder ? (
          <View style={bs.overlay}>
            <TouchableOpacity style={bs.backdrop} onPress={() => setSelectedOrder(null)} activeOpacity={1} />
            <View style={[bs.sheet, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          </View>
        ) : (
          <OrderBottomSheet order={selectedOrder} onClose={() => setSelectedOrder(null)} onPayment={handlePayment} />
        )}
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 12, paddingBottom: 16,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 24, color: '#fff' },
  headerSub: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
  },

  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 14, marginBottom: 4 },
  summaryCardOrange: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: 20, padding: 18,
  },
  summaryCardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  summaryCardLabel: { fontFamily: FONTS.medium, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  summaryCardAmount: { fontFamily: FONTS.bold, fontSize: 22, color: '#fff', marginBottom: 4 },
  summaryCardSub: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  summaryCardRight: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  completionLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  completionPct: { fontFamily: FONTS.bold, fontSize: 28, color: COLORS.textPrimary },
  completionSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  tabsWrap: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14, marginBottom: 10,
    backgroundColor: '#fff', borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: '#EDEDED',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  tabTextActive: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#fff' },
  tabIndicator: { display: 'none' },

  list: { paddingHorizontal: 16, paddingBottom: 110 },

  orderCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFF3E6', justifyContent: 'center', alignItems: 'center',
  },
  orderId: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  orderTime: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  itemPreview: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  itemCountText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  orderTotal: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.primary },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textSecondary },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});

const bs = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  orderIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFF3E6', justifyContent: 'center', alignItems: 'center' },
  orderCode: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  orderTime: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 12 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },

  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 12 },
  emptyItems: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 16 },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  qtyBadge: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#FFF3E6', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.primary },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  itemAttr: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },

  summaryBox: { marginTop: 12, backgroundColor: '#FAFAFA', borderRadius: 14, padding: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted },
  summaryValue: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textPrimary },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  totalValue: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.primary },

  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.primary, height: 54, borderRadius: 16, marginTop: 14, elevation: 4,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  payBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  qrText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

export default OrderScreen;
