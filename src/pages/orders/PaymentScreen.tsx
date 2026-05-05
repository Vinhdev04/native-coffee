/**
 * @file PaymentScreen.tsx
 * @desc Màn hình thanh toán — chọn hình thức (Cash / VNPay), gọi API,
 *       phát TTS giọng nói khi thanh toán tiền mặt thành công,
 *       hiển thị lịch sử thanh toán của đơn.
 * @layer pages/orders
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, ScrollView, Platform, StatusBar, Alert,
  TextInput, KeyboardAvoidingView, AppState, AppStateStatus, Modal,
} from 'react-native';
// Xóa expo-web-browser vì làm app bị pause trên Android
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft, Banknote, Globe, CheckCircle, Clock,
  AlertCircle, RefreshCw, Receipt,
} from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { payCash, createVNPayUrl, getPaymentHistory } from '@/services/paymentService';
import { speakPaymentSuccess } from '@/services/ttsService';
import Toast from 'react-native-toast-message';

// ─── Types ─────────────────────────────────────────────────────────────────────
type PaymentMethod = 'CASH' | 'VNPAY' | null;

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SUCCESS:    { label: 'Thành công',     color: '#065F46', bg: '#D1FAE5' },
  PAID:       { label: 'Đã thanh toán', color: '#065F46', bg: '#D1FAE5' },
  COMPLETED:  { label: 'Hoàn thành',     color: '#065F46', bg: '#D1FAE5' },
  PENDING:    { label: 'Đang xử lý',    color: '#92400E', bg: '#FEF3C7' },
  PROCESSING: { label: 'Đang xử lý',    color: '#92400E', bg: '#FEF3C7' },
  FAILED:     { label: 'Thất bại',       color: '#991B1B', bg: '#FEE2E2' },
  CANCELLED:  { label: 'Đã hủy',        color: '#6B7280', bg: '#F3F4F6' },
};

// ─── Helper ────────────────────────────────────────────────────────────────────
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

// ─── Component ─────────────────────────────────────────────────────────────────
const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, totalAmount, customerName } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [orderAlreadyPaid, setOrderAlreadyPaid] = useState(false);
  const [vnpayOpened, setVnpayOpened] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState<string | null>(null); // ✅ Thêm state cho WebView URL
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  // ✅ Tiền khách đưa (mặc định = tổng đơn)
  const [cashInput, setCashInput] = useState<string>(String(Number(totalAmount)));
  const cashChange = Math.max(0, Number(cashInput || 0) - Number(totalAmount));

  console.log(`💳 [PaymentScreen] mount — orderId=${orderId}, total=${totalAmount}, customer=${customerName}`);

  const loadHistory = useCallback(async () => {
    if (!orderId) return;
    try {
      setHistoryLoading(true);
      const res = await getPaymentHistory(orderId);
      console.log(`📋 [PaymentScreen] payment history:`, JSON.stringify(res, null, 2));
      const list = (res as any)?.data || (res as any)?.rows || res || [];
      const rawList = Array.isArray(list) ? list : (list ? [list] : []);

      // ✅ Kiểm tra đơn đã có giao dịch thành công chưa → block thanh toán lại
      const successRecord = rawList.find((p: any) => p.status === 'SUCCESS' || p.status === 'PAID');
      if (successRecord) {
        const paid = parseFloat(successRecord.amount || totalAmount);
        console.log(`⚠️ [PaymentScreen] Order ${orderId} already paid: amount=${paid}`);
        setOrderAlreadyPaid(true);
        setConfirmedAmount(paid);
        setPaymentDone(true);
      }

      // ✅ Chỉ hiển thị Thành công và Thất bại, không hiện Đang xử lý
      const filteredList = rawList.filter((p: any) => p.status !== 'PENDING' && p.status !== 'PROCESSING');
      console.log(`📋 [PaymentScreen] history display count=${filteredList.length}`);
      setPaymentHistory(filteredList);
    } catch (err) {
      console.error('❌ [PaymentScreen] loadHistory error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [orderId, totalAmount]);

  useEffect(() => { loadHistory(); }, [loadHistory]);


  // ── Auto-polling for VNPay ───────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (vnpayOpened && !paymentDone) {
      interval = setInterval(async () => {
        try {
          const res = await getPaymentHistory(orderId);
          const list = (res as any)?.data || (res as any)?.rows || res || [];
          const rawList = Array.isArray(list) ? list : (list ? [list] : []);

          // ✅ Lấy record SUCCESS từ API, dùng amount của API (không dùng local)
          const successRecord = rawList.find((p: any) => p.status === 'SUCCESS' || p.status === 'PAID');
          if (successRecord) {
            const paidAmount = parseFloat(successRecord.amount || totalAmount);
            console.log(`✅ [PaymentScreen] Auto-detected VNPay success! apiAmount=${paidAmount}`);
            setConfirmedAmount(paidAmount);
            setOrderAlreadyPaid(true);
            
            // ✅ Đóng WebView ngay lập tức
            setVnpayUrl(null);
            setVnpayOpened(false);

            setPaymentDone(true);
            speakPaymentSuccess(paidAmount, customerName).catch(console.error);
            
            Toast.show({
              type: 'success',
              text1: '🎉 Thanh toán VNPay thành công!',
              text2: `Số tiền: ${formatCurrency(paidAmount)}`,
              visibilityTime: 4000,
            });
            loadHistory();

            // Tự động quay về OrdersTab sau 2.5s
            setTimeout(() => {
              navigation.navigate('Main', { screen: 'OrdersTab' });
            }, 2500);
          }
        } catch (err) { console.warn('⚠️ [Poll] error', err); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [vnpayOpened, paymentDone, orderId, totalAmount, customerName, loadHistory]);

  // ── AppState listener — khi user quay lại từ VNPay browser ────────────────
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      // Chỉ kiểm tra khi: đang chờ VNPay + chưa done + app vừa active trở lại
      if (vnpayOpened && !paymentDone && prev !== 'active' && nextState === 'active') {
        console.log('🔄 [PaymentScreen] AppState active → checking VNPay status...');
        try {
          const res = await getPaymentHistory(orderId);
          const list = (res as any)?.data || (res as any)?.rows || res || [];
          const rawList = Array.isArray(list) ? list : (list ? [list] : []);
          const successRecord = rawList.find((p: any) => p.status === 'SUCCESS' || p.status === 'PAID');
          if (successRecord) {
            const paidAmount = parseFloat(successRecord.amount || totalAmount);
            console.log(`✅ [PaymentScreen] AppState: VNPay success detected! amount=${paidAmount}`);
            setConfirmedAmount(paidAmount);
            setOrderAlreadyPaid(true);
            setVnpayUrl(null); // Đóng WebView
            setVnpayOpened(false);
            
            setPaymentDone(true);
            speakPaymentSuccess(paidAmount, customerName).catch(console.error);

            Toast.show({
              type: 'success', text1: '🎉 Thanh toán VNPay thành công!',
              text2: `Số tiền: ${formatCurrency(paidAmount)}`, visibilityTime: 3000,
            });
            loadHistory();
            
            // Tự động quay về OrdersTab sau 2.5s
            setTimeout(() => {
              navigation.navigate('Main', { screen: 'OrdersTab' });
            }, 2500);
          }
        } catch (e) { console.warn('⚠️ [AppState check] error:', e); }
      }
    });
    return () => sub.remove();
  }, [vnpayOpened, paymentDone, orderId, totalAmount, customerName, loadHistory]);

  // ── Cash Payment ────────────────────────────────────────────────────────────
  const handleCashPayment = async () => {
    if (orderAlreadyPaid) {
      Toast.show({ type: 'info', text1: 'Đơn đã được thanh toán', text2: 'Vui lòng kiểm tra lại lịch sử.' });
      return;
    }
    const cashReceived = Number(cashInput || totalAmount);
    if (cashReceived < Number(totalAmount)) {
      Toast.show({ type: 'error', text1: 'Số tiền không đủ', text2: `Cần ít nhất ${formatCurrency(totalAmount)}` });
      return;
    }
    try {
      setProcessing(true);
      console.log(`💵 [PaymentScreen] CASH → orderId=${orderId}, cashReceived=${cashReceived}`);

      const res = await payCash(orderId, cashReceived);
      console.log(`✅ [PaymentScreen] payCash full response:`, JSON.stringify(res, null, 2));

      // ✅ FIX: Dùng res_code === 0 làm tiêu chí chính
      // vì một số trường hợp API không trả về data.isSuccess
      const resCode = (res as any)?.res_code;
      const data    = (res as any)?.data;
      const isSuccess = resCode === 0 || data?.isSuccess === true;
      const apiAmount  = parseFloat(data?.amount || String(cashReceived));

      console.log(`💵 [PaymentScreen] resCode=${resCode}, isSuccess=${isSuccess}, apiAmount=${apiAmount}`);

      if (!isSuccess) {
        const errMsg = (res as any)?.error_cont || data?.message || 'Thanh toán không thành công.';
        console.error(`❌ [PaymentScreen] payCash failed: ${errMsg}`);
        Toast.show({ type: 'error', text1: 'Thanh toán thất bại', text2: errMsg });
        return;
      }

      setConfirmedAmount(Number(totalAmount));
      setOrderAlreadyPaid(true);
      setPaymentDone(true);
      
      speakPaymentSuccess(Number(totalAmount), customerName).catch(console.error);
      
      Toast.show({
        type: 'success', text1: '🎉 Thanh toán thành công!',
        text2: `Số tiền: ${formatCurrency(Number(totalAmount))} • Tiền thừa: ${formatCurrency(cashReceived - Number(totalAmount))}`,
        visibilityTime: 3000,
      });
      loadHistory();

      // Tự động quay về OrdersTab sau 2.5s
      setTimeout(() => {
        navigation.navigate('Main', { screen: 'OrdersTab' });
      }, 2500);
    } catch (err: any) {
      console.error('❌ [PaymentScreen] Cash error:', err);
      console.error('❌ response:', JSON.stringify(err?.response?.data, null, 2));
      const errMsg = err?.response?.data?.error_cont || err?.message || 'Vui lòng thử lại.';
      Toast.show({ type: 'error', text1: 'Thanh toán thất bại', text2: errMsg });
    } finally {
      setProcessing(false);
    }
  };


  // ── VNPay Payment ───────────────────────────────────────────────────────────
  const handleVNPayPayment = async () => {
    try {
      setProcessing(true);
      console.log(`🏦 [PaymentScreen] Creating VNPay URL for order=${orderId}`);

      const res = await createVNPayUrl(orderId);
      console.log(`🏦 [PaymentScreen] VNPay URL response:`, JSON.stringify(res, null, 2));

      // Lấy URL từ response
      const url = (res as any)?.data?.paymentUrl
        || (res as any)?.paymentUrl
        || (res as any)?.data?.url
        || (res as any)?.url;

      if (!url) {
        console.error('❌ [PaymentScreen] VNPay URL not found in response:', res);
        Toast.show({ type: 'error', text1: 'Lỗi VNPay', text2: 'Không lấy được link thanh toán.' });
        return;
      }

      console.log(`🔗 [PaymentScreen] Opening VNPay in WebView: ${url}`);
      
      setVnpayOpened(true);
      // ✅ Bật WebView thay vì mở browser ngoài
      setVnpayUrl(url);

    } catch (err: any) {
      console.error('❌ [PaymentScreen] VNPay error:', err);
      const errMsg = err?.response?.data?.error_cont || err?.message || 'Vui lòng thử lại.';
      Toast.show({ type: 'error', text1: 'Tạo link VNPay thất bại', text2: errMsg });
    } finally {
      setProcessing(false);
    }
  };

  // ── Confirm Handler ─────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedMethod) {
      Toast.show({ type: 'info', text1: 'Chọn hình thức thanh toán', text2: 'Vui lòng chọn Cash hoặc VNPay.' });
      return;
    }
    if (selectedMethod === 'CASH') handleCashPayment();
    else handleVNPayPayment();
  };

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thanh toán</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={loadHistory}>
          <RefreshCw size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Order Summary ── */}
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Đơn hàng #{orderId}</Text>
          <Text style={s.summaryAmount}>{formatCurrency(totalAmount)}</Text>
          {!!customerName && (
            <Text style={s.summaryCustomer}>👤 {customerName}</Text>
          )}
        </View>

        {/* ── Payment Done Banner ── */}
        {paymentDone && (
          <View style={s.successBanner}>
            <CheckCircle size={28} color={COLORS.success} />
            <View>
              <Text style={s.successTitle}>Thanh toán thành công!</Text>
              <Text style={s.successSub}>Đơn hàng đã được xử lý.</Text>
            </View>
          </View>
        )}

        {/* ── Method Selection ── */}
        {!paymentDone && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Hình thức thanh toán</Text>

            {/* Cash */}
            <TouchableOpacity
              style={[s.methodBtn, selectedMethod === 'CASH' && s.methodBtnActive]}
              onPress={() => { setSelectedMethod('CASH'); console.log('💵 [PaymentScreen] selected: CASH'); }}
            >
              <View style={[s.methodIcon, selectedMethod === 'CASH' && s.methodIconActive]}>
                <Banknote size={22} color={selectedMethod === 'CASH' ? '#fff' : COLORS.textMuted} />
              </View>
              <View style={s.methodInfo}>
                <Text style={[s.methodTitle, selectedMethod === 'CASH' && s.methodTitleActive]}>Tiền mặt</Text>
                <Text style={s.methodDesc}>Thanh toán trực tiếp tại quầy</Text>
              </View>
              <View style={[s.methodRadio, selectedMethod === 'CASH' && s.methodRadioActive]}>
                {selectedMethod === 'CASH' && <View style={s.methodRadioDot} />}
              </View>
            </TouchableOpacity>

            {/* Cash input — hiện khi chọn Tiền mặt */}
            {selectedMethod === 'CASH' && (
              <View style={s.cashInputCard}>
                <Text style={s.cashInputLabel}>Cần thanh toán</Text>
                <Text style={s.cashInputTotal}>{formatCurrency(totalAmount)}</Text>

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
                    <Text style={s.cashChangeValue}>{formatCurrency(cashChange)}</Text>
                  </View>
                )}
                {Number(cashInput) > 0 && Number(cashInput) < Number(totalAmount) && (
                  <Text style={s.cashShortfall}>⚠️ Thiếu {formatCurrency(Number(totalAmount) - Number(cashInput))}</Text>
                )}
              </View>
            )}

            {/* VNPay */}
            <TouchableOpacity
              style={[s.methodBtn, selectedMethod === 'VNPAY' && s.methodBtnActive]}
              onPress={() => { setSelectedMethod('VNPAY'); console.log('🏦 [PaymentScreen] selected: VNPAY'); }}
            >
              <View style={[s.methodIcon, selectedMethod === 'VNPAY' && { backgroundColor: '#0B2881' }]}>
                <Globe size={22} color={selectedMethod === 'VNPAY' ? '#fff' : COLORS.textMuted} />
              </View>
              <View style={s.methodInfo}>
                <Text style={[s.methodTitle, selectedMethod === 'VNPAY' && s.methodTitleActive]}>
                  VNPay
                </Text>
                <Text style={s.methodDesc}>Thanh toán qua ví điện tử / QR</Text>
              </View>
              <View style={[s.methodRadio, selectedMethod === 'VNPAY' && s.methodRadioActive]}>
                {selectedMethod === 'VNPAY' && <View style={s.methodRadioDot} />}
              </View>
            </TouchableOpacity>

            {/* TTS note — hiện cho cả 2 phương thức */}
            {!!selectedMethod && (
              <View style={s.ttsNote}>
                <AlertCircle size={13} color={COLORS.primary} />
                <Text style={s.ttsNoteText}>
                  {selectedMethod === 'CASH'
                    ? 'Ữứng dụng sẽ phát thông báo giọng nói khi thanh toán thành công.'
                    : 'Sau khi hoàn tất VNPay, quay lại ứng dụng và nhấn Xác nhận để nghe thông báo.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Payment History ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Lịch sử thanh toán</Text>
          {historyLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
          ) : paymentHistory.length === 0 ? (
            <View style={s.emptyHistory}>
              <Receipt size={32} color={COLORS.border} />
              <Text style={s.emptyHistoryText}>Chưa có giao dịch nào</Text>
            </View>
          ) : (
            paymentHistory.map((pay: any, idx: number) => {
              const payCfg = PAYMENT_STATUS_CONFIG[pay.status] || PAYMENT_STATUS_CONFIG.PENDING;
              const method = (pay.provider || pay.method) === 'CASH' ? '💵 Tiền mặt' : '🏦 VNPay';
              console.log(`💳 [PaymentScreen] history[${idx}]:`, JSON.stringify(pay));
              return (
                <View key={pay.id || idx} style={[s.historyItem, idx < paymentHistory.length - 1 && s.historyBorder]}>
                  <View style={s.historyLeft}>
                    <Text style={s.historyMethod}>{method}</Text>
                    <Text style={s.historyTime}>{formatDateTime(pay.createTime || pay.createdAt)}</Text>
                    {!!pay.transactionId && (
                      <Text style={s.historyTxn}>TXN: {pay.transactionId}</Text>
                    )}
                  </View>
                  <View style={s.historyRight}>
                    <Text style={s.historyAmount}>{formatCurrency(pay.amount || pay.totalAmount)}</Text>
                    <View style={[s.payStatusBadge, { backgroundColor: payCfg.bg }]}>
                      <Text style={[s.payStatusText, { color: payCfg.color }]}>{payCfg.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Footer ── */}
      {/* Case 1: Chưa thanh toán — hiện nút xác nhận */}
      {!paymentDone && !vnpayOpened && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.confirmBtn, (!selectedMethod || processing) && { opacity: 0.5 }]}
            onPress={handleConfirm}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={s.confirmBtnText}>
                {selectedMethod === 'CASH' ? '💵 Xác nhận thanh toán' : '🏦 Tạo link VNPay'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      {/* Case 2: Đã mở VNPay URL — chờ user xác nhận */}
      {!paymentDone && vnpayOpened && (
        <View style={s.footer}>
          <View style={s.vnpayPendingNote}>
            <Clock size={14} color={COLORS.primary} />
            <Text style={s.vnpayPendingText}>Hoàn tất thanh toán trên VNPay rồi nhấn nút bên dưới</Text>
          </View>
          <TouchableOpacity
            style={s.vnpayConfirmBtn}
            disabled={processing}
            onPress={async () => {
              try {
                setProcessing(true);
                const res = await getPaymentHistory(orderId);
                const list = (res as any)?.data || (res as any)?.rows || res || [];
                const rawList = Array.isArray(list) ? list : (list ? [list] : []);
                const successRecord = rawList.find((p: any) => p.status === 'SUCCESS' || p.status === 'PAID');
                
                if (successRecord) {
                  console.log('✅ [PaymentScreen] VNPay confirmed by BE → playing TTS');
                  const paidAmount = parseFloat(successRecord.amount || totalAmount);
                  setPaymentDone(true);
                  setVnpayUrl(null);
                  setVnpayOpened(false);

                  speakPaymentSuccess(paidAmount, customerName).catch(console.error);

                  Toast.show({
                    type: 'success',
                    text1: '🎉 Thanh toán VNPay thành công!',
                    text2: `Tổng tiền: ${formatCurrency(paidAmount)}`,
                    visibilityTime: 4000,
                  });
                  loadHistory();
                  
                  setTimeout(() => {
                    navigation.navigate('Main', { screen: 'OrdersTab' });
                  }, 2500);
                } else {
                  console.log('⚠️ [PaymentScreen] VNPay not yet successful on BE');
                  Toast.show({
                    type: 'error',
                    text1: 'Thanh toán chưa hoàn tất',
                    text2: 'Hệ thống chưa ghi nhận trạng thái thành công từ VNPay.',
                  });
                  loadHistory();
                }
              } catch (err) {
                console.error('❌ [PaymentScreen] manual check error:', err);
                Toast.show({ type: 'error', text1: 'Lỗi kiểm tra', text2: 'Không thể kiểm tra trạng thái.' });
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
                <Text style={s.confirmBtnText}>✅ Xác nhận đã thanh toán VNPay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      {/* Case 3: Hoàn thành — Tự động quay về OrdersTab */}
      {paymentDone && (
        <View style={s.footer}>
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => {
              navigation.navigate('Main', { screen: 'OrdersTab' });
            }}
          >
            <Text style={s.doneBtnText}>Quay về ngay</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Modal hiển thị WebView VNPay */}
      {vnpayUrl && (
        <Modal visible={!!vnpayUrl} animationType="slide" onRequestClose={() => setVnpayUrl(null)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <TouchableOpacity onPress={() => setVnpayUrl(null)} style={{ padding: 8, marginRight: 8 }}>
                <ChevronLeft size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={{ fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textPrimary }}>Thanh toán VNPay</Text>
            </View>
            <WebView 
              source={{ uri: vnpayUrl }} 
              style={{ flex: 1 }} 
              startInLoadingState={true}
              renderLoading={() => <ActivityIndicator size="large" color={COLORS.primary} style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -18 }} />}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    backgroundColor: '#D8F1F3',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, flex: 1, marginLeft: 10 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },

  scroll: { padding: 16 },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 24,
    marginBottom: 14, alignItems: 'center',
  },
  summaryLabel: { fontFamily: FONTS.medium, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  summaryAmount: { fontFamily: FONTS.bold, fontSize: 34, color: COLORS.white },
  summaryCustomer: { fontFamily: FONTS.medium, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8 },

  // Success
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#ECFDF5', borderRadius: 16, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#6EE7B7',
  },
  successTitle: { fontFamily: FONTS.bold, fontSize: 16, color: '#065F46' },
  successSub: { fontFamily: FONTS.regular, fontSize: 13, color: '#059669', marginTop: 2 },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary, marginBottom: 14 },

  // Method Buttons
  methodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  methodBtnActive: { borderColor: COLORS.primary, backgroundColor: '#FFF7F0' },
  methodIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  methodIconActive: { backgroundColor: COLORS.primary },
  methodInfo: { flex: 1 },
  methodTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  methodTitleActive: { color: COLORS.primary },
  methodDesc: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  methodRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center',
  },
  methodRadioActive: { borderColor: COLORS.primary },
  methodRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  ttsNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#FFF7F0', borderRadius: 10, padding: 10, marginTop: 4,
  },
  ttsNoteText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.primary, flex: 1 },

  // Cash Input
  cashInputCard: {
    backgroundColor: '#FFFBF5', borderRadius: 14, padding: 16,
    marginTop: 8, borderWidth: 1.5, borderColor: COLORS.primary + '40',
  },
  cashInputLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  cashInputTotal: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary, marginBottom: 14 },
  cashInput: {
    height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary,
    paddingHorizontal: 14, fontFamily: FONTS.semiBold, fontSize: 18,
    color: COLORS.textPrimary, backgroundColor: '#FFFFFF',
  },
  cashChangeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12,
  },
  cashChangeLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#065F46' },
  cashChangeValue: { fontFamily: FONTS.bold, fontSize: 16, color: '#065F46' },
  cashShortfall: { fontFamily: FONTS.medium, fontSize: 13, color: '#991B1B', marginTop: 8 },


  // History
  emptyHistory: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyHistoryText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12 },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  historyLeft: { flex: 1 },
  historyRight: { alignItems: 'flex-end', gap: 6 },
  historyMethod: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  historyTime: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  historyTxn: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  historyAmount: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  payStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  payStatusText: { fontFamily: FONTS.semiBold, fontSize: 11 },

  // Footer
  footer: {
    padding: 16, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  confirmBtn: {
    height: 56, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  confirmBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  doneBtn: {
    height: 56, borderRadius: 16, backgroundColor: COLORS.success,
    justifyContent: 'center', alignItems: 'center',
  },
  doneBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  // VNPay confirm
  vnpayPendingNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF7F0', borderRadius: 10, padding: 10, marginBottom: 10,
  },
  vnpayPendingText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.primary, flex: 1 },
  vnpayConfirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 56, borderRadius: 16, backgroundColor: COLORS.success, elevation: 4,
  },
});

export default PaymentScreen;
