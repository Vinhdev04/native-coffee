/**
 * @file OrderDetailScreen.tsx
 * @desc Màn hình chi tiết đơn hàng — hiển thị items, trạng thái timeline,
 *       nút Thanh toán và nút Hủy đơn (nếu PENDING).
 * @layer pages/orders
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft, Package, Clock, CheckCircle, XCircle,
  CreditCard, User, Phone, FileText, AlertTriangle,
} from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchOrderById, cancelOrder } from '@/services/orderService';
import Toast from 'react-native-toast-message';
import { orderCache } from '@/utils/orderCache';

// ─── Status Config ─────────────────────────────────────────────────────────────
// ✅ API dùng field `orderStatus`, không phải `status`
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:           { label: 'Nháp',           color: '#6B7280', bg: '#F3F4F6', icon: Clock },
  PENDING:         { label: 'Chờ xử lý',      color: '#92400E', bg: '#FEF3C7', icon: Clock },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#92400E', bg: '#FEF3C7', icon: Clock },
  PAID:            { label: 'Đã thanh toán',   color: '#065F46', bg: '#D1FAE5', icon: CheckCircle },
  READY:           { label: 'Sẵn sàng',       color: '#1E40AF', bg: '#DBEAFE', icon: CheckCircle },
  DONE:            { label: 'Hoàn thành',     color: '#374151', bg: '#F3F4F6', icon: CheckCircle },
  CANCELLED:       { label: 'Đã hủy',         color: '#991B1B', bg: '#FEE2E2', icon: XCircle },
  CANCEL:          { label: 'Đã hủy',         color: '#991B1B', bg: '#FEE2E2', icon: XCircle },
};

const LOG_STATUS_LABELS: Record<string, string> = {
  DRAFT:           'Đơn được tạo',
  PENDING:         'Chờ xử lý',
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID:            'Đã thanh toán',
  READY:           'Sẵn sàng phục vụ',
  DONE:            'Hoàn thành',
  CANCELLED:       'Đã hủy',
  CANCEL:          'Đã hủy',
};

// ─── Helper ────────────────────────────────────────────────────────────────────
const formatDateTime = (raw: string) => {
  if (!raw) return '—';
  try {
    // Format: YYYYMMDDHHmmss
    if (raw.length >= 12) {
      const y = raw.slice(0, 4);
      const m = raw.slice(4, 6);
      const d = raw.slice(6, 8);
      const h = raw.slice(8, 10);
      const mn = raw.slice(10, 12);
      return `${h}:${mn} • ${d}/${m}/${y}`;
    }
    return raw;
  } catch {
    return raw;
  }
};

// ─── Component ─────────────────────────────────────────────────────────────────
const OrderDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  console.log(`🔍 [OrderDetailScreen] mount — orderId=${orderId}`);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      console.error('❌ [OrderDetailScreen] No orderId provided!');
      return;
    }
    try {
      const res = await fetchOrderById(orderId);
      console.log(`✅ [OrderDetailScreen] order data:`, JSON.stringify(res, null, 2));
      // API trả về data ở res.data hoặc thẳng res
      const orderData = (res as any)?.data ?? res;
      console.log(`✅ [OrderDetailScreen] orderStatus=${orderData?.orderStatus}, paymentStatus=${orderData?.paymentStatus}`);
      setOrder(orderData);
      // Cập nhật cache số món
      if (orderData?.items) {
        orderCache.setCount(orderId, orderData.items.length);
      }

    } catch (err) {
      console.error('❌ [OrderDetailScreen] loadOrder error:', err);
      Toast.show({ type: 'error', text1: 'Không tải được đơn hàng', text2: 'Vui lòng thử lại.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await cancelOrder(orderId);
      Toast.show({ type: 'success', text1: 'Đã hủy đơn hàng' });
      loadOrder();
    } catch (err) {
      console.error('❌ [OrderDetailScreen] cancelOrder error:', err);
      Toast.show({ type: 'error', text1: 'Hủy đơn thất bại' });
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = () => {
    // ✅ FIX: dùng orderStatus và parseFloat cho totalAmount
    const total = parseFloat(order?.totalAmount || order?.total || '0');
    console.log(`💳 [OrderDetailScreen] navigate to Payment → orderId=${orderId}, total=${total}`);
    navigation.navigate('Payment', {
      orderId,
      totalAmount: total,
      customerName: order?.customerName,
    });
  };

  // ✅ FIX: dùng orderStatus thay vì status
  const orderStatus = order?.orderStatus || order?.status || '';
  const cfg = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.PENDING_PAYMENT;
  const StatusIcon = cfg.icon;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <Package size={60} color={COLORS.border} />
          <Text style={s.emptyText}>Không tìm thấy đơn hàng</Text>
          <TouchableOpacity style={s.backBtnLarge} onPress={() => navigation.goBack()}>
            <Text style={s.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canPay    = ['PENDING', 'PENDING_PAYMENT', 'DRAFT'].includes(orderStatus);
  const canCancel = ['PENDING', 'PENDING_PAYMENT'].includes(orderStatus);
  const logs: any[] = order.logs || order.orderLogs || [];
  const items: any[] = order.items || order.orderItems || [];
  const displayTotal = parseFloat(order.totalAmount || order.total || '0');
  console.log(`🔍 [OrderDetailScreen] orderStatus=${orderStatus}, canPay=${canPay}, canCancel=${canCancel}, total=${displayTotal}`);

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Đơn #{orderId}</Text>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <StatusIcon size={13} color={cfg.color} />
          <Text style={[s.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrder(); }}
            tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
      >
        {/* ── Customer Info ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Thông tin khách hàng</Text>
          <View style={s.infoRow}>
            <User size={15} color={COLORS.textMuted} />
            <Text style={s.infoLabel}>Tên:</Text>
            <Text style={s.infoValue}>{order.customerName || 'Khách vãng lai'}</Text>
          </View>
          {!!order.customerPhone && (
            <View style={s.infoRow}>
              <Phone size={15} color={COLORS.textMuted} />
              <Text style={s.infoLabel}>SĐT:</Text>
              <Text style={s.infoValue}>{order.customerPhone}</Text>
            </View>
          )}
          {!!order.note && (
            <View style={s.infoRow}>
              <FileText size={15} color={COLORS.textMuted} />
              <Text style={s.infoLabel}>Ghi chú:</Text>
              <Text style={s.infoValue}>{order.note}</Text>
            </View>
          )}
          <View style={s.infoRow}>
            <Clock size={15} color={COLORS.textMuted} />
            <Text style={s.infoLabel}>Thời gian:</Text>
            <Text style={s.infoValue}>{formatDateTime(order.createTime)}</Text>
          </View>
        </View>

        {/* ── Order Items ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sản phẩm ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={s.emptyText}>Không có sản phẩm</Text>
          ) : (
            items.map((item: any, idx: number) => {
              // ✅ API trả về snapshot fields (không phải productName trực tiếp)
              const productName = item.productNameSnapshot
                || item.productName || item.name
                || `Sản phẩm #${item.productId || item.id}`;
              const unitPrice = parseFloat(
                item.unitPriceSnapshot || item.lineTotal || item.price || item.unitPrice || 0
              );
              const qty = item.qty || item.quantity || 1;
              // Giá hiển thị: lineTotal đã = unitPrice * qty, nên dùng thẳng
              const lineTotal = parseFloat(item.lineTotal || String(unitPrice * qty));
              const attrs: any[] = item.selectedOptionsSnapshot
                || item.selectedAttributes || item.productAttributes || [];
              console.log(`📦 [OrderDetail] item[${idx}]:`, JSON.stringify(item));
              return (
                <View key={item.id || idx} style={[s.itemRow, idx < items.length - 1 && s.itemBorder]}>
                  <View style={s.itemLeft}>
                    <Text style={s.itemName}>{productName}</Text>
                    {attrs.length > 0 && (
                      <Text style={s.itemAttr}>
                        {attrs.map((a: any) => a.name || a.attributeName || a.value).filter(Boolean).join(' • ')}
                      </Text>
                    )}
                    {!!item.note && <Text style={s.itemNote}>📝 {item.note}</Text>}
                    <Text style={s.itemUnitPrice}>{formatCurrency(unitPrice)} / cái</Text>
                  </View>
                  <View style={s.itemRight}>
                    <Text style={s.itemQty}>x{qty}</Text>
                    <Text style={s.itemPrice}>{formatCurrency(lineTotal)}</Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Tổng */}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tổng cộng</Text>
            <Text style={s.totalValue}>{formatCurrency(displayTotal)}</Text>
          </View>
        </View>

        {/* ── Status Timeline ── */}
        {logs.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Lịch sử trạng thái</Text>
            {logs.map((log: any, idx: number) => {
              const logCfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.PENDING;
              const LogIcon = logCfg.icon;
              const isLast = idx === logs.length - 1;
              return (
                <View key={log.id || idx} style={s.timelineItem}>
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, { backgroundColor: logCfg.color }]}>
                      <LogIcon size={10} color="#fff" />
                    </View>
                    {!isLast && <View style={s.timelineLine} />}
                  </View>
                  <View style={s.timelineContent}>
                    <Text style={[s.timelineStatus, { color: logCfg.color }]}>
                      {LOG_STATUS_LABELS[log.status] || log.status}
                    </Text>
                    <Text style={s.timelineTime}>{formatDateTime(log.createTime || log.updatedAt)}</Text>
                    {!!log.note && <Text style={s.timelineNote}>{log.note}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Action Buttons ── */}
      <View style={s.actions}>
        {canCancel && (
          <TouchableOpacity
            style={[s.cancelBtn, cancelling && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? <ActivityIndicator size="small" color={COLORS.error} />
              : <><AlertTriangle size={16} color={COLORS.error} /><Text style={s.cancelBtnText}>Hủy đơn</Text></>
            }
          </TouchableOpacity>
        )}
        {canPay && (
          <TouchableOpacity style={[s.payBtn, !canCancel && { flex: 1 }]} onPress={handlePayment}>
            <CreditCard size={18} color={COLORS.white} />
            <Text style={s.payBtnText}>Thanh toán</Text>
          </TouchableOpacity>
        )}
        {!canPay && !canCancel && (
          <View style={s.paidInfo}>
            <CheckCircle size={18} color={COLORS.success} />
            <Text style={s.paidInfoText}>
              {['DONE', 'PAID'].includes(orderStatus) ? 'Đơn đã được thanh toán' : cfg.label}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  emptyText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    backgroundColor: '#D8F1F3',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, flex: 1, marginLeft: 10 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  statusBadgeText: { fontFamily: FONTS.semiBold, fontSize: 12 },

  scroll: { padding: 16 },

  // Cards
  card: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary, marginBottom: 14 },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  infoLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, width: 60 },
  infoValue: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textPrimary, flex: 1 },

  // Items
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'flex-start' },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemLeft: { flex: 1, marginRight: 12 },
  itemRight: { alignItems: 'flex-end' },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  itemAttr: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  itemNote: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.primary, marginTop: 3 },
  itemQty: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, marginTop: 2 },
  itemUnitPrice: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 3 },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 14, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  totalLabel: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textSecondary },
  totalValue: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.primary },

  // Timeline
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: 12, width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4, marginBottom: 0 },
  timelineContent: { flex: 1, paddingBottom: 18 },
  timelineStatus: { fontFamily: FONTS.semiBold, fontSize: 13 },
  timelineTime: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  timelineNote: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  // Action Buttons
  actions: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  cancelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.error,
  },
  cancelBtnText: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.error },
  payBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 52, borderRadius: 14, backgroundColor: COLORS.primary, elevation: 4,
  },
  payBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.white },
  paidInfo: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  paidInfoText: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.success },
  backBtnLarge: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: COLORS.primary, borderRadius: 12,
  },
  backBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.white },
});

export default OrderDetailScreen;
