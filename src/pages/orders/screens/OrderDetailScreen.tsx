/**
 * @file OrderDetailScreen.tsx
 * @desc Màn hình chi tiết đơn hàng — hiển thị items, trạng thái timeline,
 *       nút Thanh toán và nút Hủy đơn.
 * @layer pages/orders
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform, StatusBar, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft, Package, CreditCard, User, FileText, Calendar
} from 'lucide-react-native';
import { COLORS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchOrderById, cancelOrder } from '@/services/orderService';
import Toast from 'react-native-toast-message';
import { orderCache } from '@/utils/orderCache';
import { useTranslation } from 'react-i18next';
import { s } from '../styles/OrderDetailScreen.styles';
import { OrderStatus, getStatusConfig } from '../constants';
import { OrderDetails } from '../types';

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

  const { t } = useTranslation();
  const STATUS_CONFIG = getStatusConfig(t);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  console.log(`[OrderDetailScreen] Gắn màn hình — orderId=${orderId}`);

  // TODO: Hàm loadOrder lấy chi tiết thông tin đơn hàng từ Backend và lưu vào cache
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

  // TODO: Hàm handleCancel gửi yêu cầu hủy đơn hàng hiện tại lên hệ thống
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

  // TODO: Hàm handlePayment điều hướng người dùng sang màn hình thanh toán đơn hàng
  const handlePayment = () => {
    // Tích hợp: Sử dụng orderStatus và parseFloat cho totalAmount
    const total = parseFloat(String(order?.totalAmount || order?.total || '0'));
    console.log(`[OrderDetailScreen] Chuyển hướng sang Thanh toán → orderId=${orderId}, tổng tiền=${total}`);
    navigation.navigate('Payment', {
      orderId,
      totalAmount: total,
      customerName: order?.customerName,
    });
  };

  // Tích hợp: Sử dụng orderStatus thay vì status
  const orderStatus = (order?.orderStatus || order?.status || '') as OrderStatus;
  const cfg = STATUS_CONFIG[orderStatus] || STATUS_CONFIG[OrderStatus.PENDING];
  const StatusIcon = cfg.Icon;

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
  const displayTotal = parseFloat(String(order.totalAmount || order.total || '0'));
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
              <Text style={s.metaText}>{formatDateTime(order.createTime || '')}</Text>
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
              const lineTotal = parseFloat(item.lineTotal || String((item.unitPrice || 0) * (item.qty || item.quantity || 1)));
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

export default OrderDetailScreen;
