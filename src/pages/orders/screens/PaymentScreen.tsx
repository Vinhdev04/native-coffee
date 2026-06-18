/**
 * @file PaymentScreen.tsx
 * @desc Màn hình thanh toán — chọn hình thức (Cash / VNPay), gọi API,
 *       phát TTS giọng nói khi thanh toán tiền mặt thành công,
 *       hiển thị lịch sử thanh toán của đơn.
 *       Tích hợp: in hóa đơn Sunmi POS + chia sẻ ảnh bill qua ViewShot.
 * @layer pages/orders
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  AppState,
  AppStateStatus,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChevronLeft,
  Banknote,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Receipt,
  Printer,
  Share2,
  X,
  QrCode,
} from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { COLORS, FONTS } from "@/styles/theme";
import { formatCurrency } from "@/utils";
import {
  payCash,
  createVNPayUrl,
  getPaymentHistory,
} from "@/services/paymentService";
import { speakPaymentSuccess } from "@/services/ttsService";
import Toast from "react-native-toast-message";
import BillReceiptComponent, {
  BillItem,
} from "@/components/BillReceiptComponent";
import { printBillOnSunmi, shareBillImage } from "@/services/billService";
import ReceiptModal from "@/components/common/ReceiptModal";
import { fetchOrderById } from "@/services/orderService";
import { s } from "../styles/PaymentScreen.styles";
import { PAYMENT_STATUS_CONFIG } from "../constants";
import { PaymentMethod, PaymentRecord } from "../types";

// ─── Các kiểu dữ liệu (Types) ─────────────────────────────────────────────────────────────────────

const inferVatType = (
  rawVatType: any,
  vatAmount: number,
  subTotal: number,
  discount: number,
  totalAmountValue: number,
) => {
  if (rawVatType === "exclusive" || rawVatType === "inclusive") return rawVatType;
  if (vatAmount <= 0) return "none";

  const exclusiveTotal = subTotal - discount + vatAmount;
  return Math.abs(totalAmountValue - exclusiveTotal) <= 1
    ? "exclusive"
    : "inclusive";
};

const inferVatRate = (
  rawVatRate: number,
  vatAmount: number,
  subTotal: number,
  discount: number,
  vatType: string,
) => {
  if (rawVatRate > 0 || vatAmount <= 0) return rawVatRate;
  const taxableAmount = Math.max(0, subTotal - discount);
  if (taxableAmount <= 0) return 0;

  const base =
    vatType === "inclusive" ? Math.max(1, taxableAmount - vatAmount) : taxableAmount;
  return Number(((vatAmount / base) * 100).toFixed(2));
};

// ─── Tiện ích hỗ trợ (Helper) ────────────────────────────────────────────────────────────────────
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

// ─── Hợp phần (Component) ─────────────────────────────────────────────────────────────────
const PaymentScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, totalAmount, customerName } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [orderAlreadyPaid, setOrderAlreadyPaid] = useState(false);
  const [vnpayOpened, setVnpayOpened] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState<string | null>(null); // State cho WebView URL
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown in seconds

  // Hiệu ứng đếm ngược thời gian hiệu lực cho mã QR
  useEffect(() => {
    let timerInterval: any = null;
    if (vnpayOpened && vnpayUrl && !paymentDone) {
      setTimeLeft(300); // Reset về 5 phút khi có URL mới
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            // Hết giờ -> Tự động đóng modal QR
            setVnpayUrl(null);
            setVnpayOpened(false);
            Toast.show({
              type: "error",
              text1: "Mã QR hết hiệu lực",
              text2: "Giao dịch thanh toán VNPay đã hết hạn.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [vnpayOpened, vnpayUrl, paymentDone]);

  // Hàm định dạng giây thành dạng MM:SS
  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `Còn ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  // todo: Tiền khách đưa (mặc định = tổng đơn)
  const [cashInput, setCashInput] = useState<string>(
    String(Number(totalAmount)),
  );
  // todo: Tính tiền thừa thối lại cho khách
  const cashChange = Math.max(0, Number(cashInput || 0) - Number(totalAmount));

  // todo: Các trạng thái hỗ trợ hiển thị hóa đơn và in ấn
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [billPrinting, setBillPrinting] = useState(false);
  const [billSharing, setBillSharing] = useState(false);
  const [orderItems, setOrderItems] = useState<BillItem[]>([]);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderDetail, setOrderDetail] = useState<any>(null);

  // Lấy chi tiết đơn để lấy danh sách món cho bill
  useEffect(() => {
    if (!orderId) return;
    const fetchItems = async () => {
      try {
        const res = await fetchOrderById(orderId);
        const detail = (res as any)?.data ?? res;
        setOrderDetail(detail);
        const items = (detail?.items || detail?.orderItems || []).map(
          (i: any) => ({
            name: i.productNameSnapshot || i.productName || i.name || "Món",
            quantity: i.qty || i.quantity || 1,
            unitPrice:
              parseFloat(i.lineTotal || i.unitPriceSnapshot || "0") /
              (i.qty || i.quantity || 1),
            attributes: (
              i.selectedOptionsSnapshot ||
              i.selectedAttributes ||
              []
            ).map((a: any) => ({
              name: a.name || a.attributeName || "",
              price: 0,
            })),
          }),
        );
        setOrderItems(items);
        setOrderDiscount(
          parseFloat(detail.totalDiscount || detail.discountAmount || "0"),
        );
      } catch (err) {
        console.warn(
          "[PaymentScreen] Không thể lấy danh sách món cho hóa đơn:",
          err,
        );
      }
    };
    fetchItems();
  }, [orderId]);

  /** Xây dựng BillData từ lịch sử thanh toán + route params */
  const billData = useMemo(() => {
    const vat = Number(orderDetail?.vatAmount ?? orderDetail?.taxAmount ?? 0);
    const rawVatRate = Number(orderDetail?.vatRate ?? orderDetail?.taxRate ?? 0);
    const rawVatType = orderDetail?.vatType ?? orderDetail?.taxType;
    const total = Number(
      orderDetail?.grandTotal ??
        orderDetail?.totalAmount ??
        orderDetail?.total ??
        totalAmount,
    );
    const sub = Number(
      orderDetail?.subTotal ??
        orderDetail?.subtotalAmount ??
        total + (orderDiscount || 0) - (rawVatType === "exclusive" ? vat : 0),
    );
    const vatType = inferVatType(rawVatType, vat, sub, orderDiscount || 0, total);
    const vatRate = inferVatRate(rawVatRate, vat, sub, orderDiscount || 0, vatType);

    return {
      id: orderId,
      orderId,
      customerName: customerName || "Khách vãng lai",
      createdAt: new Date().toLocaleString("vi-VN"),
      items: orderItems,
      totalPrice: total,
      discount: orderDiscount,
      paymentMethod: selectedMethod || "CASH",
      // Các trường phụ trợ cho ReceiptModal/BillReceiptComponent
      subTotal: sub,
      vatAmount: vat,
      vatRate,
      vatType,
      totalAmount: total,
      cashReceived: selectedMethod === "CASH" ? Number(cashInput) : undefined,
      cashChange: selectedMethod === "CASH" ? cashChange : undefined,
    };
  }, [
    orderId,
    totalAmount,
    customerName,
    orderItems,
    orderDiscount,
    orderDetail,
    selectedMethod,
    cashInput,
    cashChange,
  ]);

  console.log(
    `[PaymentScreen] Gắn màn hình — mã đơn=${orderId}, tổng tiền=${totalAmount}, khách hàng=${customerName}`,
  );

  const loadHistory = useCallback(async () => {
    if (!orderId) return;
    try {
      setHistoryLoading(true);
      const res = await getPaymentHistory(orderId);
      console.log(
        `[PaymentScreen] Lịch sử thanh toán:`,
        JSON.stringify(res, null, 2),
      );
      const list = (res as any)?.data || (res as any)?.rows || res || [];
      const rawList = Array.isArray(list) ? list : list ? [list] : [];

      // Kiểm tra đơn đã có giao dịch thành công chưa → chặn thanh toán lại
      const successRecord = rawList.find(
        (p: any) => p.status === "SUCCESS" || p.status === "PAID",
      );
      if (successRecord) {
        const paid = parseFloat(successRecord.amount || totalAmount);
        console.log(
          `[PaymentScreen] Đơn hàng ${orderId} đã được thanh toán: số tiền=${paid}`,
        );
        setOrderAlreadyPaid(true);
        setConfirmedAmount(paid);
        setPaymentDone(true);
      }

      // Chỉ hiển thị Thành công và Thất bại, không hiện Đang xử lý
      const filteredList = rawList.filter(
        (p: any) => p.status !== "PENDING" && p.status !== "PROCESSING",
      );
      console.log(
        `[PaymentScreen] Số lượng lịch sử hiển thị=${filteredList.length}`,
      );
      setPaymentHistory(filteredList);
    } catch (err) {
      console.error("[PaymentScreen] Lỗi tải lịch sử giao dịch (loadHistory):", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [orderId, totalAmount]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Tự động kiểm tra trạng thái VNPay (Auto-polling) ───────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (vnpayOpened && !paymentDone) {
      interval = setInterval(async () => {
        try {
          const res = await getPaymentHistory(orderId);
          const list = (res as any)?.data || (res as any)?.rows || res || [];
          const rawList = Array.isArray(list) ? list : list ? [list] : [];

          // Lấy record SUCCESS từ API, dùng amount của API (không dùng local)
          const successRecord = rawList.find(
            (p: any) => p.status === "SUCCESS" || p.status === "PAID",
          );
          if (successRecord) {
            const paidAmount = parseFloat(successRecord.amount || totalAmount);
            console.log(
              `[PaymentScreen] Tự động phát hiện VNPay thành công! Số tiền API=${paidAmount}`,
            );
            setConfirmedAmount(paidAmount);
            setOrderAlreadyPaid(true);

            // Đóng WebView ngay lập tức
            setVnpayUrl(null);
            setVnpayOpened(false);

            setPaymentDone(true);
            speakPaymentSuccess(paidAmount, customerName);

            Toast.show({
              type: "success",
              text1: "Thanh toán VNPay thành công!",
              text2: `Số tiền: ${formatCurrency(paidAmount)}`,
              visibilityTime: 4000,
            });
            loadHistory();

            // Redirect về OrdersTab tab Đang chờ
            setTimeout(() => {
              navigation.navigate("Main", {
                screen: "OrdersTab",
                params: { initialTab: "pending" },
              });
            }, 2500);
          }
        } catch (err) {
          console.warn("[Poll] Lỗi truy vấn trạng thái", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [
    vnpayOpened,
    paymentDone,
    orderId,
    totalAmount,
    customerName,
    loadHistory,
  ]);

  // ── Trình lắng nghe AppState — khi người dùng quay lại từ trình duyệt VNPay ────────────────
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      // Chỉ kiểm tra khi: đang chờ VNPay + chưa done + app vừa active trở lại
      if (
        vnpayOpened &&
        !paymentDone &&
        prev !== "active" &&
        nextState === "active"
      ) {
        console.log(
          "[PaymentScreen] Ứng dụng hoạt động trở lại → đang kiểm tra trạng thái VNPay...",
        );
        try {
          const res = await getPaymentHistory(orderId);
          const list = (res as any)?.data || (res as any)?.rows || res || [];
          const rawList = Array.isArray(list) ? list : list ? [list] : [];
          const successRecord = rawList.find(
            (p: any) => p.status === "SUCCESS" || p.status === "PAID",
          );
          if (successRecord) {
            const paidAmount = parseFloat(successRecord.amount || totalAmount);
            console.log(
              `[PaymentScreen] Trạng thái ứng dụng: Phát hiện VNPay thành công! Số tiền=${paidAmount}`,
            );
            setConfirmedAmount(paidAmount);
            setOrderAlreadyPaid(true);
            setVnpayUrl(null); // Đóng WebView
            setVnpayOpened(false);

            setPaymentDone(true);
            speakPaymentSuccess(paidAmount, customerName);

            Toast.show({
              type: "success",
              text1: "🎉 Thanh toán VNPay thành công!",
              text2: `Số tiền: ${formatCurrency(paidAmount)}`,
              visibilityTime: 3000,
            });
            loadHistory();

            // Redirect về OrdersTab tab Đang chờ
            setTimeout(() => {
              navigation.navigate("Main", {
                screen: "OrdersTab",
                params: { initialTab: "pending" },
              });
            }, 2500);
          }
        } catch (e) {
          console.warn("[Kiểm tra trạng thái] Lỗi:", e);
        }
      }
    });
    return () => sub.remove();
  }, [
    vnpayOpened,
    paymentDone,
    orderId,
    totalAmount,
    customerName,
    loadHistory,
  ]);

  // ── Thanh toán bằng tiền mặt (Cash Payment) ────────────────────────────────────────────────────────────
  // TODO: Hàm handleCashPayment xử lý thanh toán đơn hàng bằng tiền mặt tại quầy và gọi API cập nhật
  const handleCashPayment = async () => {
    if (orderAlreadyPaid) {
      Toast.show({
        type: "info",
        text1: "Đơn đã được thanh toán",
        text2: "Vui lòng kiểm tra lại lịch sử.",
      });
      return;
    }
    const cashReceived = Number(cashInput || totalAmount);
    if (cashReceived < Number(totalAmount)) {
      Toast.show({
        type: "error",
        text1: "Số tiền không đủ",
        text2: `Cần ít nhất ${formatCurrency(totalAmount)}`,
      });
      return;
    }
    try {
      setProcessing(true);
      console.log(
        `[PaymentScreen] Tiền mặt → mã đơn=${orderId}, số tiền nhận=${cashReceived}`,
      );

      const res = await payCash(orderId, cashReceived);
      console.log(
        `[PaymentScreen] Phản hồi đầy đủ của payCash:`,
        JSON.stringify(res, null, 2),
      );

      // Thành công khi: res_code=0 VÀ có paymentId trong data
      const resCode = (res as any)?.res_code;
      const data = (res as any)?.data;
      const isSuccess =
        resCode === 0 && (data?.paymentId != null || data?.isSuccess === true);
      const apiAmount = parseFloat(data?.amount || String(cashReceived));

      console.log(
        `[PaymentScreen] resCode=${resCode}, isSuccess=${isSuccess}, paymentId=${data?.paymentId}, apiAmount=${apiAmount}`,
      );

      if (!isSuccess) {
        const errMsg =
          (res as any)?.error_cont ||
          data?.message ||
          "Thanh toán không thành công.";
        console.error(`[PaymentScreen] payCash thất bại: ${errMsg}`);
        Toast.show({
          type: "error",
          text1: "Thanh toán thất bại",
          text2: errMsg,
        });
        return;
      }

      setConfirmedAmount(Number(totalAmount));
      setOrderAlreadyPaid(true);
      setPaymentDone(true);

      speakPaymentSuccess(Number(totalAmount), customerName);

      Toast.show({
        type: "success",
        text1: "🎉 Thanh toán thành công!",
        text2: `Số tiền: ${formatCurrency(
          Number(totalAmount),
        )} • Tiền thừa: ${formatCurrency(cashReceived - Number(totalAmount))}`,
        visibilityTime: 3000,
      });
      loadHistory();

      // Redirect về tab Đang chờ
      setTimeout(() => {
        navigation.navigate("Main", {
          screen: "OrdersTab",
          params: { initialTab: "pending" },
        });
      }, 2500);
    } catch (err: any) {
      console.error("[PaymentScreen] Lỗi thanh toán tiền mặt:", err);
      console.error("Phản hồi lỗi:", JSON.stringify(err?.response?.data, null, 2));
      const errMsg =
        err?.response?.data?.error_cont || err?.message || "Vui lòng thử lại.";
      Toast.show({
        type: "error",
        text1: "Thanh toán thất bại",
        text2: errMsg,
      });
    } finally {
      setProcessing(false);
    }
  };

  // ── Thanh toán VNPay (VNPay Payment) ───────────────────────────────────────────────────────────
  // TODO: Hàm handleVNPayPayment tạo link thanh toán VNPay thông qua API và mở WebView cho người dùng quét mã
  const handleVNPayPayment = async () => {
    try {
      setProcessing(true);
      console.log(`[PaymentScreen] Đang tạo đường dẫn VNPay cho đơn hàng=${orderId}`);

      const res = await createVNPayUrl(orderId);
      console.log(
        `[PaymentScreen] Phản hồi tạo link VNPay:`,
        JSON.stringify(res, null, 2),
      );

      // Lấy URL từ response
      const url =
        (res as any)?.data?.paymentUrl ||
        (res as any)?.paymentUrl ||
        (res as any)?.data?.url ||
        (res as any)?.url;

      if (!url) {
        console.error(
          "[PaymentScreen] Không tìm thấy URL VNPay trong phản hồi:",
          res,
        );
        Toast.show({
          type: "error",
          text1: "Lỗi VNPay",
          text2: "Không lấy được link thanh toán.",
        });
        return;
      }

      console.log(`[PaymentScreen] Đang mở VNPay trong WebView: ${url}`);
      setVnpayOpened(true);
      // Bật WebView thay vì mở trình duyệt ngoài
      setVnpayUrl(url);
    } catch (err: any) {
      console.error("[PaymentScreen] Lỗi VNPay:", err);
      const errMsg =
        err?.response?.data?.error_cont || err?.message || "Vui lòng thử lại.";
      Toast.show({
        type: "error",
        text1: "Tạo link VNPay thất bại",
        text2: errMsg,
      });
    } finally {
      setProcessing(false);
    }
  };

  // ── Xử lý xác nhận (Confirm Handler) ─────────────────────────────────────────────────────────
  // TODO: Hàm handleConfirm điều hướng thanh toán dựa theo phương thức được chọn (Tiền mặt / VNPay)
  const handleConfirm = () => {
    if (!selectedMethod) {
      Toast.show({
        type: "info",
        text1: "Chọn hình thức thanh toán",
        text2: "Vui lòng chọn Cash hoặc VNPay.",
      });
      return;
    }
    if (selectedMethod === "CASH") handleCashPayment();
    else handleVNPayPayment();
  };

  return (
    <SafeAreaView style={s.container}>
      {/* ── Tiêu đề ── */}
      <View style={[s.header, { paddingHorizontal: isSmallScreen ? 12 : 20 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thanh toán</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={loadHistory}>
          <RefreshCw size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { padding: isSmallScreen ? 12 : 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Tóm tắt đơn hàng ── */}
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Đơn hàng #{orderId}</Text>
          <Text style={s.summaryAmount}>{formatCurrency(totalAmount)}</Text>
          {!!customerName && (
            <Text style={s.summaryCustomer}>👤 {customerName}</Text>
          )}
        </View>

        {/* ── Biểu ngữ thanh toán thành công ── */}
        {paymentDone && (
          <View style={s.successBanner}>
            <CheckCircle size={28} color={COLORS.success} />
            <View>
              <Text style={s.successTitle}>Thanh toán thành công!</Text>
              <Text style={s.successSub}>Đơn hàng đã được xử lý.</Text>
            </View>
          </View>
        )}

        {/* ── Chọn hình thức thanh toán ── */}
        {!paymentDone && (
          <View style={[s.card, { padding: isSmallScreen ? 12 : 18 }]}>
            <Text style={s.cardTitle}>Hình thức thanh toán</Text>

            {/* Cash */}
            <TouchableOpacity
              style={[
                s.methodBtn,
                selectedMethod === "CASH" && s.methodBtnActive,
              ]}
              onPress={() => {
                setSelectedMethod("CASH");
                console.log("💵 [PaymentScreen] selected: CASH");
              }}
            >
              <View
                style={[
                  s.methodIcon,
                  selectedMethod === "CASH" && s.methodIconActive,
                ]}
              >
                <Banknote
                  size={22}
                  color={selectedMethod === "CASH" ? "#fff" : COLORS.textMuted}
                />
              </View>
              <View style={s.methodInfo}>
                <Text
                  style={[
                    s.methodTitle,
                    selectedMethod === "CASH" && s.methodTitleActive,
                  ]}
                >
                  Tiền mặt
                </Text>
                <Text style={s.methodDesc}>Thanh toán trực tiếp tại quầy</Text>
              </View>
              <View
                style={[
                  s.methodRadio,
                  selectedMethod === "CASH" && s.methodRadioActive,
                ]}
              >
                {selectedMethod === "CASH" && <View style={s.methodRadioDot} />}
              </View>
            </TouchableOpacity>

            {/* Nhập tiền mặt — hiện khi chọn Tiền mặt */}
            {selectedMethod === "CASH" && (
              <View style={s.cashInputCard}>
                <Text style={s.cashInputLabel}>Cần thanh toán</Text>
                <Text style={s.cashInputTotal}>
                  {formatCurrency(totalAmount)}
                </Text>

                <Text style={s.cashInputLabel}>Tiền khách đưa</Text>
                <TextInput
                  style={s.cashInput}
                  keyboardType="numeric"
                  value={cashInput}
                  onChangeText={setCashInput}
                  placeholder="Nhập số tiền..."
                  placeholderTextColor={COLORS.textMuted}
                  returnKeyType="done"
                />

                {Number(cashInput) >= Number(totalAmount) && (
                  <View style={s.cashChangeRow}>
                    <Text style={s.cashChangeLabel}>Tiền thừa trả lại</Text>
                    <Text style={s.cashChangeValue}>
                      {formatCurrency(cashChange)}
                    </Text>
                  </View>
                )}
                {Number(cashInput) > 0 &&
                  Number(cashInput) < Number(totalAmount) && (
                    <Text style={s.cashShortfall}>
                      ⚠️ Thiếu{" "}
                      {formatCurrency(Number(totalAmount) - Number(cashInput))}
                    </Text>
                  )}
              </View>
            )}

            {/* VNPay */}
            <TouchableOpacity
              style={[
                s.methodBtn,
                selectedMethod === "VNPAY" && s.methodBtnActive,
              ]}
              onPress={() => {
                setSelectedMethod("VNPAY");
                console.log("🏦 [PaymentScreen] selected: VNPAY");
              }}
            >
              <View
                style={[
                  s.methodIcon,
                  selectedMethod === "VNPAY" && { backgroundColor: "#0B2881" },
                ]}
              >
                <Globe
                  size={22}
                  color={selectedMethod === "VNPAY" ? "#fff" : COLORS.textMuted}
                />
              </View>
              <View style={s.methodInfo}>
                <Text
                  style={[
                    s.methodTitle,
                    selectedMethod === "VNPAY" && s.methodTitleActive,
                  ]}
                >
                  VNPay
                </Text>
                <Text style={s.methodDesc}>Thanh toán qua ví điện tử / QR</Text>
              </View>
              <View
                style={[
                  s.methodRadio,
                  selectedMethod === "VNPAY" && s.methodRadioActive,
                ]}
              >
                {selectedMethod === "VNPAY" && (
                  <View style={s.methodRadioDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* Ghi chú TTS — hiện cho cả 2 phương thức */}
            {!!selectedMethod && (
              <View style={s.ttsNote}>
                <AlertCircle size={13} color={COLORS.primary} />
                <Text style={s.ttsNoteText}>
                  {selectedMethod === "CASH"
                    ? "Ứng dụng sẽ phát thông báo giọng nói khi thanh toán thành công."
                    : "Sau khi hoàn tất VNPay, quay lại ứng dụng và nhấn Xác nhận để nghe thông báo."}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Lịch sử thanh toán ── */}
        <View style={[s.card, { padding: isSmallScreen ? 12 : 18 }]}>
          <Text style={s.cardTitle}>Lịch sử thanh toán</Text>
          {historyLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginVertical: 16 }}
            />
          ) : paymentHistory.length === 0 ? (
            <View style={s.emptyHistory}>
              <Receipt size={32} color={COLORS.border} />
              <Text style={s.emptyHistoryText}>Chưa có giao dịch nào</Text>
            </View>
          ) : (
            paymentHistory.map((pay: any, idx: number) => {
              const payCfg =
                PAYMENT_STATUS_CONFIG[pay.status] ||
                PAYMENT_STATUS_CONFIG.PENDING;
              const method =
                (pay.provider || pay.method) === "CASH" ? "Tiền mặt" : "VNPay";
              console.log(`[PaymentScreen] Lịch sử giao dịch[${idx}]:`, JSON.stringify(pay));
              return (
                <View
                  key={pay.id || idx}
                  style={[
                    s.historyItem,
                    idx < paymentHistory.length - 1 && s.historyBorder,
                  ]}
                >
                  <View style={s.historyLeft}>
                    <Text style={s.historyMethod}>{method}</Text>
                    <Text style={s.historyTime}>
                      {formatDateTime(pay.createTime || pay.createdAt)}
                    </Text>
                    {!!pay.transactionId && (
                      <Text style={s.historyTxn}>TXN: {pay.transactionId}</Text>
                    )}
                  </View>
                  <View style={s.historyRight}>
                    <Text style={s.historyAmount}>
                      {formatCurrency(pay.amount || pay.totalAmount)}
                    </Text>
                    <View
                      style={[s.payStatusBadge, { backgroundColor: payCfg.bg }]}
                    >
                      <Text style={[s.payStatusText, { color: payCfg.color }]}>
                        {payCfg.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Chân trang ── */}
      {/* Trường hợp 1: Chưa thanh toán — hiện nút xác nhận */}
      {!paymentDone && !vnpayOpened && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[
              s.confirmBtn,
              (!selectedMethod || processing) && { opacity: 0.5 },
            ]}
            onPress={handleConfirm}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={s.confirmBtnText}>
                {selectedMethod === "CASH"
                  ? "Xác nhận thanh toán"
                  : "Tạo link VNPay"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      {/* Trường hợp 2: Đã mở VNPay URL — chờ người dùng xác nhận */}
      {!paymentDone && vnpayOpened && (
        <View style={s.footer}>
          <View style={s.vnpayPendingNote}>
            <Clock size={14} color={COLORS.primary} />
            <Text style={s.vnpayPendingText}>
              Hoàn tất thanh toán trên VNPay rồi nhấn nút bên dưới
            </Text>
          </View>
          <TouchableOpacity
            style={s.vnpayConfirmBtn}
            disabled={processing}
            onPress={async () => {
              try {
                setProcessing(true);
                const res = await getPaymentHistory(orderId);
                const list =
                  (res as any)?.data || (res as any)?.rows || res || [];
                const rawList = Array.isArray(list) ? list : list ? [list] : [];
                const successRecord = rawList.find(
                  (p: any) => p.status === "SUCCESS" || p.status === "PAID",
                );

                if (successRecord) {
                  console.log('[PaymentScreen] VNPay được xác nhận bởi BE → đang phát TTS');
                  const paidAmount = parseFloat(
                    successRecord.amount || totalAmount,
                  );
                  setPaymentDone(true);
                  setVnpayUrl(null);
                  setVnpayOpened(false);

                  speakPaymentSuccess(paidAmount, customerName);

                  Toast.show({
                    type: "success",
                    text1: "Thanh toán VNPay thành công!",
                    text2: `Tổng tiền: ${formatCurrency(paidAmount)}`,
                    visibilityTime: 4000,
                  });
                  loadHistory();

                  setTimeout(() => {
                    navigation.navigate("Main", {
                      screen: "OrdersTab",
                      params: { initialTab: "pending" },
                    });
                  }, 2500);
                } else {
                  console.log('[PaymentScreen] VNPay chưa thành công trên BE');
                  Toast.show({
                    type: "error",
                    text1: "Thanh toán chưa hoàn tất",
                    text2:
                      "Hệ thống chưa ghi nhận trạng thái thành công từ VNPay.",
                  });
                  loadHistory();
                }
              } catch (err) {
                console.error('[PaymentScreen] Lỗi kiểm tra thủ công:', err);
                Toast.show({
                  type: "error",
                  text1: "Lỗi kiểm tra",
                  text2: "Không thể kiểm tra trạng thái.",
                });
              } finally {
                setProcessing(false);
              }
            }}
          >
            {processing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <CheckCircle size={18} color={COLORS.white} />
                <Text style={s.confirmBtnText}>
                  Xác nhận đã thanh toán VNPay
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      {/* Trường hợp 3: Hoàn thành — Tự động quay về OrdersTab */}
      {paymentDone && (
        <View style={s.footer}>
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() =>
              navigation.navigate("Main", {
                screen: "OrdersTab",
                params: { initialTab: "pending" },
              })
            }
          >
            <Text style={s.doneBtnText}>Hoàn tất & Quay về</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Modal hiển thị QR Code thanh toán VNPay */}
      {vnpayUrl && (
        <Modal
          visible={!!vnpayUrl}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setVnpayUrl(null);
            setVnpayOpened(false);
          }}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <View style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: '#1E233D',
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: '#1565C0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <QrCode size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontFamily: FONTS.bold, color: '#fff' }}>Thanh toán VNPAY</Text>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.regular }} numberOfLines={1}>
                      Mã đơn: {orderDetail?.orderCode || `#${orderId}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setVnpayUrl(null);
                    setVnpayOpened(false);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Order Info Row */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 16,
                padding: 12,
                marginBottom: 20,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.medium }}>Mã đơn</Text>
                  <Text style={{ fontSize: 14, fontFamily: FONTS.bold, color: '#fff', marginTop: 2 }} numberOfLines={1}>
                    {orderDetail?.orderCode || `ORD-${orderId}`}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#FFF5EB',
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignItems: 'flex-end',
                }}>
                  <Text style={{ fontSize: 10, color: '#FF7300', fontFamily: FONTS.medium }}>Số tiền</Text>
                  <Text style={{ fontSize: 16, color: '#FF7300', fontFamily: FONTS.bold, marginTop: 2 }}>
                    {formatCurrency(totalAmount)}
                  </Text>
                </View>
              </View>

              {/* QR Code Container */}
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}>
                <QRCode
                  value={vnpayUrl}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
              </View>

              {/* Countdown Timer */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#E8F0FE',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignSelf: 'center',
                marginBottom: 16,
              }}>
                <Clock size={16} color="#1A73E8" />
                <Text style={{
                  fontSize: 14,
                  fontFamily: FONTS.bold,
                  color: '#1A73E8',
                }}>
                  {formatTimeLeft(timeLeft)}
                </Text>
              </View>

              <Text style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                fontFamily: FONTS.regular,
                marginBottom: 16,
              }}>
                Mã giao dịch: {orderId}
              </Text>

              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                fontFamily: FONTS.medium,
                lineHeight: 18,
                marginBottom: 20,
                paddingHorizontal: 10,
              }}>
                Khách quét mã bằng app ngân hàng hoặc ví VNPAY để thanh toán.
              </Text>

              {/* Action Buttons */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: '#EF4444',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setVnpayUrl(null);
                  setVnpayOpened(false);
                  Toast.show({
                    type: "info",
                    text1: "Đã hủy giao dịch",
                    text2: "Yêu cầu thanh toán VNPay đã bị hủy.",
                  });
                }}
              >
                <Text style={{ color: '#EF4444', fontFamily: FONTS.bold, fontSize: 15 }}>Hủy giao dịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};
export default PaymentScreen;
