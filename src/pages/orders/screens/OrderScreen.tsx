/**
 * @file OrderScreen.tsx
 * @desc Danh sách đơn hàng — 3 tabs (Tất cả / Đang chờ / Hoàn thành),
 *       summary card, bottom sheet chi tiết đơn.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { COLORS } from "@/styles/theme";
import { formatCurrency } from "@/utils";
import { fetchOrders, fetchOrderById } from "@/services/orderService";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
  Receipt,
  CreditCard,
  AlertTriangle,
  X,
  QrCode,
  ScanLine,
  Printer,
  User,
} from "lucide-react-native";
import ReceiptModal from "@/components/common/ReceiptModal";
import { orderCache } from "@/utils/orderCache";
import QRCode from "react-native-qrcode-svg";
import { useTranslation } from 'react-i18next';
import { s, bs } from "../styles/OrderScreen.styles";
import {
  OrderStatus,
  PENDING_STATUSES,
  DONE_STATUSES,
  CANCEL_STATUSES,
  getStatusConfig,
} from "../constants";

const { height: SH } = Dimensions.get("window");

const formatDate = (raw: string, t: any) => {
  if (!raw) return t('just_now') || "Vừa xong";
  try {
    if (raw.length >= 12) {
      const h = raw.slice(8, 10),
        mn = raw.slice(10, 12);
      const d = raw.slice(6, 8),
        mo = raw.slice(4, 6);
      return `${h}:${mn}  ${d}/${mo}`;
    }
    return raw;
  } catch {
    return raw;
  }
};

const formatDateTime = (raw: string) => {
  if (!raw) return "—";
  try {
    if (raw.length >= 12) {
      const y = raw.slice(0, 4),
        m = raw.slice(4, 6),
        d = raw.slice(6, 8);
      const h = raw.slice(8, 10),
        mn = raw.slice(10, 12);
      return `${h}:${mn} • ${d}/${m}/${y}`;
    }
    return raw;
  } catch {
    return raw;
  }
};

// ─── Hợp phần Bottom Sheet (Bảng kéo từ dưới lên) ───────────────────────────────────────────────────
export const OrderBottomSheet = ({
  order,
  onClose,
  onPayment,
  onPrint,
}: {
  order: any;
  onClose: () => void;
  onPayment: () => void;
  onPrint?: () => void;
}) => {
  const { height: SH, width: SW } = useWindowDimensions();
  const isSmallScreen = SW < 360;

  const { t } = useTranslation();
  if (!order) return null;
  const STATUS_CONFIG = getStatusConfig(t);
  const statusKey = order.orderStatus || order.status || "PENDING";
  const cfg = (STATUS_CONFIG as Record<string, any>)[statusKey] || STATUS_CONFIG[OrderStatus.PENDING];
  const items: any[] = order.items || order.orderItems || [];
  const total = parseFloat(order.totalAmount || order.total || "0");
  const canPay = PENDING_STATUSES.includes(statusKey as OrderStatus);
  const paymentMethod =
    order.paymentMethod || order.payments?.[0]?.provider || null;

  return (
    <View style={bs.overlay}>
      <TouchableOpacity
        style={bs.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={bs.sheet}>
        {/* Handle */}
        <View style={bs.handle} />

        {/* Header Redesigned */}
        <View style={bs.headerContainer}>
          <View style={bs.headerTop}>
            <View style={bs.headerIdRow}>
              <View style={bs.orderIcon}>
                <Receipt size={18} color={COLORS.primary} />
              </View>
              <Text style={bs.orderCode}>
                {order.orderCode || `#${order.id}`}
              </Text>
              <View style={[bs.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[bs.statusText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={bs.closeBtn}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={bs.headerInfoRow}>
            <View style={bs.headerInfoText}>
              <View style={bs.infoItem}>
                <Clock size={14} color={COLORS.textMuted} />
                <Text style={bs.orderTime}>
                  {formatDateTime(order.createTime)}
                </Text>
              </View>
              <View style={[bs.infoItem, { marginTop: 4 }]}>
                <User size={14} color={COLORS.textMuted} />
                <Text style={bs.orderTime}>
                  {order.customerName || t('anonymous_customer')}
                </Text>
              </View>
            </View>
            {onPrint && !CANCEL_STATUSES.includes(statusKey as OrderStatus) && (
              <TouchableOpacity onPress={onPrint} style={bs.printActionBtn}>
                <Printer size={18} color={COLORS.white} />
                <Text style={bs.printActionText}>In Bill</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: SH * 0.4 }}
        >
          {/* Danh sách món ăn/thức uống */}
          <Text style={bs.sectionTitle}>{t('item_details')}</Text>
          {items.length === 0 ? (
            <Text style={bs.emptyItems}>{t('no_products')}</Text>
          ) : (
            items.map((item: any, idx: number) => {
              const name =
                item.productNameSnapshot ||
                item.productName ||
                item.name ||
                `Món #${idx + 1}`;
              const qty = item.qty || item.quantity || 1;
              const lineTotal = parseFloat(
                item.lineTotal || item.unitPriceSnapshot || "0",
              );
              const attrs: any[] =
                item.selectedOptionsSnapshot || item.selectedAttributes || [];
              const attrStr = attrs
                .map((a: any) => a.name || a.attributeName)
                .filter(Boolean)
                .join(", ");
              return (
                <View
                  key={item.id || idx}
                  style={[bs.itemRow, idx < items.length - 1 && bs.itemBorder]}
                >
                  <View style={bs.qtyBadge}>
                    <Text style={bs.qtyText}>{qty}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={bs.itemName}>{name}</Text>
                    {!!attrStr && <Text style={bs.itemAttr}>{attrStr}</Text>}
                  </View>
                  <Text style={bs.itemPrice}>{formatCurrency(lineTotal)}</Text>
                </View>
              );
            })
          )}

          {/* Tóm tắt đơn hàng */}
          <View style={bs.summaryBox}>
            <View style={bs.summaryRow}>
              <Text style={bs.summaryLabel}>{t('total_items')}</Text>
              <Text style={bs.summaryValue}>{t('item_count', { count: items.length })}</Text>
            </View>
            {!!paymentMethod && (
              <View style={bs.summaryRow}>
                <Text style={bs.summaryLabel}>{t('payment_method')}</Text>
                <Text style={bs.summaryValue}>
                  {paymentMethod === "CASH" ? t('cash') : paymentMethod}
                </Text>
              </View>
            )}
            <View
              style={[
                bs.summaryRow,
                {
                  marginTop: 8,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: "#F0F0F0",
                },
              ]}
            >
              <Text style={bs.totalLabel}>{t('total')}</Text>
              <Text style={bs.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Phần Mã QR để thanh toán (Luôn hiện để thanh toán) */}
        <View style={bs.qrContainer}>
          <View style={bs.qrWrapper}>
            <QRCode
              value={`https://bill.chips.vn/pay/${order.id}`}
              size={120}
              color={COLORS.textPrimary}
              backgroundColor="transparent"
            />
          </View>
          <View style={bs.qrInfo}>
            <QrCode size={16} color={COLORS.textMuted} />
            <Text style={bs.qrText}>
              {canPay ? t('scan_to_pay') : t('scan_to_view_details')}
            </Text>
          </View>
        </View>

        {/* Nút hành động (CTA) */}
        {canPay && (
          <TouchableOpacity style={bs.payBtn} onPress={onPayment}>
            <CreditCard size={18} color="#fff" />
            <Text style={bs.payBtnText}>{t('pay_now')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Hợp phần chính ───────────────────────────────────────────────────────────
const OrderScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "done">("all");
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const { t } = useTranslation();
  const TABS = [
    { key: "all", label: t('all') },
    { key: "pending", label: t('pending') },
    { key: "done", label: t('done') },
  ];
  
  const STATUS_CONFIG = getStatusConfig(t);

  // TODO: Hàm loadOrders tải danh sách toàn bộ đơn hàng từ backend và cập nhật số lượng món từ cache
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({ limit: 100 });
      const all: any[] =
        (res as any)?.data?.rows ||
        (res as any)?.data ||
        (res as any)?.rows ||
        res ||
        [];
      const globalCache = orderCache.getAll();
      const merged = all.map((o: any) => {
        const cached = globalCache[o.id];
        return cached !== undefined ? { ...o, itemCount: cached } : o;
      });
      setAllOrders(merged);
      if (merged.length > 0) {
        console.log(
          "[OrderScreen] Dữ liệu đơn hàng đầu tiên:",
          JSON.stringify(merged[0], null, 2),
        );
      }
    } catch (err) {
      console.error('[OrderScreen] Lỗi tải danh sách đơn hàng (loadOrders):', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // useFocusEffect duy nhất: load đơn + áp tab từ params nếu có
  useFocusEffect(
    useCallback(() => {
      const tab = route.params?.initialTab;
      if (tab === "pending" || tab === "done" || tab === "all") {
        setActiveTab(tab);
      }
      loadOrders();
    }, [loadOrders, route.params?.initialTab]),
  );

  // TODO: Hàm onRefresh xử lý sự kiện kéo xuống để làm mới danh sách đơn hàng
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const filteredOrders = allOrders.filter((o: any) => {
    const st = (o.orderStatus || o.status || "") as OrderStatus;
    if (activeTab === "pending") return PENDING_STATUSES.includes(st);
    if (activeTab === "done")
      return [...DONE_STATUSES, ...CANCEL_STATUSES].includes(st);
    return true;
  });

  // Thống kê tóm tắt (hôm nay)
  const todayOrders = allOrders.filter((o: any) => {
    if (!o.createTime) return false;
    const today = new Date();
    const d = o.createTime.slice(6, 8),
      mo = o.createTime.slice(4, 6),
      y = o.createTime.slice(0, 4);
    return (
      parseInt(d) === today.getDate() &&
      parseInt(mo) === today.getMonth() + 1 &&
      parseInt(y) === today.getFullYear()
    );
  });
  const todayTotal = todayOrders.reduce(
    (sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"),
    0,
  );
  const doneCount = allOrders.filter((o: any) =>
    DONE_STATUSES.includes((o.orderStatus || o.status || "") as OrderStatus),
  ).length;
  const completionPct =
    allOrders.length > 0 ? Math.round((doneCount / allOrders.length) * 100) : 0;

  // TODO: Hàm handleOrderPress tải chi tiết đơn hàng được chọn và hiển thị thông tin lên BottomSheet
  const handleOrderPress = async (item: any) => {
    try {
      setSheetLoading(true);
      setSelectedOrder(item); // Hiển thị bảng ngay lập tức với dữ liệu cơ bản
      const res = await fetchOrderById(item.id);
      const detail = (res as any)?.data ?? res;
      setSelectedOrder(detail);
      // Lưu vào cache và cập nhật list ngay lập tức
      if (detail?.items) {
        const count = detail.items.length;
        orderCache.setCount(item.id, count);
        setAllOrders((prev) =>
          prev.map((o) => (o.id === item.id ? { ...o, itemCount: count } : o)),
        );
      }
    } catch {
      setSelectedOrder(item);
    } finally {
      setSheetLoading(false);
    }
  };

  // TODO: Hàm handlePayment điều hướng đơn hàng sang màn hình chọn phương thức thanh toán
  const handlePayment = () => {
    if (!selectedOrder) return;
    const total = parseFloat(
      selectedOrder.totalAmount || selectedOrder.total || "0",
    );
    setSelectedOrder(null);
    navigation.navigate("Payment", {
      orderId: selectedOrder.id,
      totalAmount: total,
      customerName: selectedOrder.customerName,
    });
  };

  // TODO: Hàm handlePrintOrder thiết lập dữ liệu hóa đơn xem trước và mở modal in hóa đơn
  const handlePrintOrder = (order: any) => {
    setReceiptData({
      id: order.id,
      orderId: order.id,
      orderCode: order.orderCode,
      items: (order.items || order.orderItems || []).map((item: any) => ({
        name: item.productNameSnapshot || item.productName || item.name,
        quantity: item.qty || item.quantity || 1,
        unitPrice:
          parseFloat(item.lineTotal || item.unitPriceSnapshot || "0") /
          (item.qty || item.quantity || 1),
        attributes: (
          item.selectedOptionsSnapshot ||
          item.selectedAttributes ||
          []
        ).map((a: any) => ({
          name: a.name || a.attributeName || "",
          price: 0,
        })),
      })),
      totalPrice: parseFloat(order.totalAmount || order.total || "0"),
      discount: parseFloat(
        order.totalDiscount || order.discountAmount || "0",
      ),
      customerName: order.customerName || t('anonymous_customer'),
      createdAt: formatDate(order.createTime, t),
    });
    setIsReceiptVisible(true);
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusKey = item.orderStatus || item.status || "PENDING";
    const cfg = (STATUS_CONFIG as Record<string, any>)[statusKey] || STATUS_CONFIG[OrderStatus.PENDING];
    const StatusIcon = cfg.Icon;
    const items: any[] = item.items || item.orderItems || [];
    const total = parseFloat(item.totalAmount || item.total || "0");
    const previewName =
      items[0]?.productNameSnapshot ||
      items[0]?.productName ||
      items[0]?.name ||
      item.customerName ||
      "";
    // API danh sách trả về số món qua nhiều tên field khác nhau
    const rawCount =
      item.itemCount ??
      item.totalItems ??
      item.item_count ??
      item.total_items ??
      null;
    const itemCount = rawCount !== null ? rawCount : items.length;
    const itemCountLabel =
      itemCount > 0
        ? t('item_count', { count: itemCount })
        : items.length === 0
        ? "—"
        : t('item_count', { count: 0 });

    return (
      <TouchableOpacity
        style={s.orderCard}
        activeOpacity={0.88}
        onPress={() => handleOrderPress(item)}
      >
        <View style={s.cardTop}>
          <View style={s.orderIdRow}>
            <View style={s.orderIcon}>
              <Receipt size={15} color={COLORS.primary} />
            </View>
            <View>
              <Text style={s.orderId}>{item.orderCode || `#${item.id}`}</Text>
              <Text style={s.orderTime}>{formatDate(item.createTime, t)}</Text>
            </View>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <StatusIcon size={11} color={cfg.color} />
            <Text style={[s.statusText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>

        {!!previewName && (
          <Text style={s.itemPreview} numberOfLines={1}>
            {itemCount > 0
              ? `${itemCount > 1 ? `${itemCount}x ` : ""}${previewName}`
              : previewName}
            {itemCount > 1 && items.length > 1
              ? ` và ${items.length - 1} món khác`
              : ""}
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

      {/* Tiêu đề */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Chips Bill</Text>
          <Text style={s.headerSub}>{t('order_management', { count: allOrders.length })}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={s.refreshBtn}
            onPress={() => navigation.navigate("ScanQR")}
          >
            <ScanLine size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Thẻ tóm tắt */}
      <View style={s.summaryRow}>
        <View style={s.summaryCardOrange}>
          <View style={s.summaryCardTopRow}>
            <Clock size={14} color="rgba(255,255,255,0.8)" />
            <Text style={s.summaryCardLabel}>{t('today')}</Text>
          </View>
          <Text style={s.summaryCardAmount} adjustsFontSizeToFit numberOfLines={1}>{formatCurrency(todayTotal)}</Text>
          <Text style={s.summaryCardSub}>{todayOrders.length} đơn</Text>
        </View>
        <View style={s.summaryCardRight}>
          <View style={s.completionRow}>
            <CheckCircle size={14} color={COLORS.success} />
            <Text style={s.completionLabel}>{t('completed')}</Text>
          </View>
          <Text style={s.completionPct} adjustsFontSizeToFit numberOfLines={1}>{completionPct}%</Text>
          <Text style={s.completionSub}>
            {doneCount}/{allOrders.length} đơn
          </Text>
        </View>
      </View>

      {/* Các tab chuyển đổi */}
      <View style={s.tabsWrap}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách đơn hàng */}
      {loading && !refreshing ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>{t('loading_orders')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => String(item.id)}
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
              <Package size={60} color="#E5E7EB" />
              <Text style={s.emptyTitle}>{t('no_orders')}</Text>
              <Text style={s.emptyText}>
                {activeTab === "pending"
                  ? t('no_pending_orders')
                  : activeTab === "done"
                  ? t('no_completed_orders')
                  : t('no_orders_yet')}
              </Text>
            </View>
          }
        />
      )}

      {/* Bảng chi tiết kéo lên (Bottom Sheet) */}
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        {sheetLoading && selectedOrder ? (
          <View style={bs.overlay}>
            <TouchableOpacity
              style={bs.backdrop}
              onPress={() => setSelectedOrder(null)}
              activeOpacity={1}
            />
            <View
              style={[
                bs.sheet,
                {
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 40,
                },
              ]}
            >
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          </View>
        ) : (
          <OrderBottomSheet
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onPayment={handlePayment}
            onPrint={() => handlePrintOrder(selectedOrder)}
          />
        )}
      </Modal>

      <ReceiptModal
        visible={isReceiptVisible}
        onClose={() => setIsReceiptVisible(false)}
        order={receiptData}
        title="HÓA ĐƠN BÁN HÀNG"
      />
    </SafeAreaView>
  );
};

export default OrderScreen;
