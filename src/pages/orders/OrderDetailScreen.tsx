/**
 * @file OrderDetailScreen.tsx
 * @desc Màn hình chi tiết đơn hàng — hiển thị items, trạng thái timeline,
 *       nút Thanh toán và nút Hủy đơn.
 * @layer pages/orders
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Platform, StatusBar, Image, useWindowDimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft, Package, Clock, CheckCircle, XCircle,
  CreditCard, User, Phone, FileText, AlertTriangle, X, MapPin, Calendar
} from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchOrderById, cancelOrder } from '@/services/orderService';
import Toast from 'react-native-toast-message';
import { orderCache } from '@/utils/orderCache';

// ─── Cấu hình trạng thái ─────────────────────────────────────────────────────────────
// API dùng trường `orderStatus`, không phải `status`
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:           { label: 'Nháp',           color: '#6B7280', bg: '#F3F4F6', icon: Clock },
  PENDING:         { label: 'Chờ xử lý',      color: '#92400E', bg: '#FEF3C7', icon: Clock },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#B45309', bg: '#FFF7ED', icon: Clock },
  PAID:            { label: 'Đã thanh toán',   color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  READY:           { label: 'Sẵn sàng',       color: '#2563EB', bg: '#DBEAFE', icon: CheckCircle },
  DONE:            { label: 'Hoàn thành',     color: '#10B981', bg: '#E1FBF2', icon: CheckCircle },
  CANCELLED:       { label: 'Đã hủy',         color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
  CANCEL:          { label: 'Đã hủy',         color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
};

// ─── Tiện ích hỗ trợ ────────────────────────────────────────────────────────────────────
const formatDateTime = (raw: string) => {
  if (!raw) return '—';
  try {
    if (raw.length >= 12) {
      const y = raw.slice(0, 4);
      const m = raw.slice(4, 6);
      const d = raw.slice(6, 8);
      const h = raw.slice(8, 10);
      const mn = raw.slice(10, 12);
      return `${h}:${mn} - ${d}/${m}/${y}`;
    }
    return raw;
  } catch {
    return raw;
  }
};

// ─── Hợp phần (Component) ─────────────────────────────────────────────────────────────────
const OrderDetailScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  console.log(`[OrderDetailScreen] Gắn màn hình — orderId=${orderId}`);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      console.error('[OrderDetailScreen] Không cung cấp orderId!');
      return;
    }
    try {
      const res = await fetchOrderById(orderId);
      console.log(`[OrderDetailScreen] Dữ liệu đơn hàng:`, JSON.stringify(res, null, 2));
      const orderData = (res as any)?.data ?? res;
      console.log(`[OrderDetailScreen] Trạng thái đơn hàng=${orderData?.orderStatus}, Trạng thái thanh toán=${orderData?.paymentStatus}`);
      setOrder(orderData);
      if (orderData?.items) {
        orderCache.setCount(orderId, orderData.items.length);
      }
    } catch (err) {
      console.error('[OrderDetailScreen] Lỗi tải đơn hàng:', err);
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
      console.error('[OrderDetailScreen] Lỗi hủy đơn hàng:', err);
      Toast.show({ type: 'error', text1: 'Hủy đơn thất bại' });
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = () => {
    // Tích hợp: Sử dụng orderStatus và parseFloat cho totalAmount
    const total = parseFloat(order?.totalAmount || order?.total || '0');
    console.log(`[OrderDetailScreen] Chuyển hướng sang Thanh toán → orderId=${orderId}, tổng tiền=${total}`);
    navigation.navigate('Payment', {
      orderId,
      totalAmount: total,
      customerName: order?.customerName,
    });
  };

  // Tích hợp: Sử dụng orderStatus thay vì status
  const orderStatus = order?.orderStatus || order?.status || '';
  const cfg = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
  const items: any[] = order.items || order.orderItems || [];
  const displayTotal = parseFloat(order.totalAmount || order.total || '0');
  console.log(`[OrderDetailScreen] Trạng thái đơn=${orderStatus}, Có thể thanh toán=${canPay}, Có thể hủy=${canCancel}, Tổng hiển thị=${displayTotal}`);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ── Tiêu đề ── */}
      <View style={[s.header, { paddingHorizontal: isSmallScreen ? 12 : 20 }]}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { padding: isSmallScreen ? 12 : 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrder(); }} />
        }
      >
        {/* ── Thẻ trạng thái đơn hàng ── */}
        <View style={[s.statusCard, { padding: isSmallScreen ? 16 : 24 }]}>
          <View style={[s.statusIconContainer, { backgroundColor: cfg.bg }]}>
             <StatusIcon size={32} color={cfg.color} />
          </View>
          <Text style={[s.statusText, { color: cfg.color, fontSize: isSmallScreen ? 18 : 22 }]}>{cfg.label}</Text>
          <Text style={s.orderIdText}>Mã đơn: #{orderId}</Text>
          <View style={s.orderMetaRow}>
            <View style={s.metaItem}>
              <Calendar size={14} color={COLORS.textMuted} />
              <Text style={s.metaText}>{formatDateTime(order.createTime)}</Text>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaItem}>
              <User size={14} color={COLORS.textMuted} />
              <Text style={s.metaText}>{order.customerName || 'Khách hàng'}</Text>
            </View>
          </View>
        </View>

        {/* ── Danh sách sản phẩm ── */}
        <View style={[s.sectionCard, { padding: isSmallScreen ? 14 : 20 }]}>
          <View style={s.sectionHeader}>
            <Package size={18} color={COLORS.textPrimary} />
            <Text style={s.sectionTitle}>Sản phẩm đã chọn</Text>
            <View style={s.itemCountBadge}>
               <Text style={s.itemCountText}>{items.length}</Text>
            </View>
          </View>
          
          <View style={s.itemsList}>
            {items.map((item: any, idx: number) => {
              const productName = item.productNameSnapshot || item.productName || item.name || 'Sản phẩm';
              const lineTotal = parseFloat(item.lineTotal || String((item.unitPrice || 0) * (item.qty || 1)));
              const qty = item.qty || item.quantity || 1;
              const attrs: any[] = item.selectedOptionsSnapshot || item.selectedAttributes || [];


              return (
                <View key={item.id || idx} style={[s.itemRow, idx === items.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={s.itemMain}>
                    <View style={s.qtyCircle}>
                      <Text style={s.qtyCircleText}>{qty}</Text>
                    </View>
                    <View style={s.itemInfo}>
                      <Text style={s.itemName}>{productName}</Text>
                      {attrs.length > 0 && (
                        <Text style={s.itemAttr}>
                          {attrs.map((a: any) => a.name || a.value).join(' • ')}
                        </Text>
                      )}
                      {!!item.note && (
                        <View style={s.noteContainer}>
                          <FileText size={12} color={COLORS.primary} />
                          <Text style={s.itemNote}>{item.note}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={s.itemPrice}>{formatCurrency(lineTotal)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Payment Summary ── */}
        <View style={[s.sectionCard, { padding: isSmallScreen ? 14 : 20 }]}>
          <View style={s.sectionHeader}>
            <CreditCard size={18} color={COLORS.textPrimary} />
            <Text style={s.sectionTitle}>Thông tin thanh toán</Text>
          </View>
          
          <View style={s.paymentInfo}>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Hình thức</Text>
              <Text style={s.paymentValue}>{order.paymentMethod || 'Tiền mặt'}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Tạm tính</Text>
              <Text style={s.paymentValue}>{formatCurrency(order.subtotalAmount || displayTotal)}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Khuyến mãi</Text>
              <Text style={[s.paymentValue, { color: COLORS.error }]}>-{formatCurrency(order.discountAmount || 0)}</Text>
            </View>
            <View style={s.lineDivider} />
            <View style={s.paymentRow}>
              <Text style={s.totalLabel}>Tổng cộng</Text>
              <Text style={s.totalValue}>{formatCurrency(displayTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Nút hành động ── */}
      {(canCancel || canPay) && (
        <View style={[s.actions, { padding: isSmallScreen ? 12 : 20 }]}>
          {canCancel && (
            <TouchableOpacity
              style={[s.cancelBtn, cancelling && { opacity: 0.6 }]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? <ActivityIndicator size="small" color={COLORS.error} /> : <Text style={s.cancelBtnText}>Hủy đơn</Text>}
            </TouchableOpacity>
          )}
          {canPay && (
            <TouchableOpacity style={s.payBtn} onPress={handlePayment}>
              <Text style={s.payBtnText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Định dạng giao diện (Styles) ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
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
    backgroundColor: COLORS.white, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  statusIconContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusText: { fontFamily: FONTS.bold, fontSize: 22, marginBottom: 4 },
  orderIdText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
  orderMetaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  metaDivider: { width: 1, height: 12, backgroundColor: '#E5E7EB', marginHorizontal: 12 },

  sectionCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, flex: 1 },
  itemCountBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  itemCountText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted },

  itemsList: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  itemMain: { flexDirection: 'row', flex: 1 },
  qtyCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  qtyCircleText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  itemAttr: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: '#FFF7ED', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  itemNote: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.primary },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary, marginLeft: 10 },

  paymentInfo: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentLabel: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  paymentValue: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  lineDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  totalValue: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },

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

export default OrderDetailScreen;
