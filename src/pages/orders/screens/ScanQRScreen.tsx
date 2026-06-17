import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { ChevronLeft, QrCode } from 'lucide-react-native';
import { COLORS } from '@/styles/theme';
import Toast from 'react-native-toast-message';
import { OrderBottomSheet } from './OrderScreen';
import { fetchOrderById } from '@/services/orderService';
import { s } from '../styles/ScanQRScreen.styles';

// TODO: Thành phần chính ScanQRScreen thực hiện quét mã QR qua Camera
const ScanQRScreen = () => {
  const navigation = useNavigation<any>();
  // todo: trạng thái đã quét thành công hay chưa
  const [scanned, setScanned] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // TODO: Xử lý khi camera đọc được mã QR
  const handleReadCode = async (event: any) => {
    if (scanned || loadingOrder || selectedOrder) return;
    
    const qrValue = event.nativeEvent.codeStringValue;
    console.log('Scanned QR:', qrValue);
    
    let orderId = null;

    try {
      // todo: Cố gắng parse theo định dạng JSON cũ (Backward compatibility)
      const data = JSON.parse(qrValue);
      if (data.action === 'view_order' && data.orderId) {
        orderId = data.orderId;
      }
    } catch (e) {
      // todo: Nếu không phải JSON, kiểm tra xem có phải định dạng URL mới không
      if (qrValue.includes('/order/')) {
        const parts = qrValue.split('/order/');
        if (parts.length > 1) {
          const potentialId = parts[1].split('?')[0].split('/')[0];
          if (potentialId && !isNaN(Number(potentialId))) {
            orderId = Number(potentialId);
          }
        }
      }
    }

    if (orderId) {
      setScanned(true);
      setLoadingOrder(true);
      
      try {
        // todo: gọi API để lấy thông tin chi tiết đơn hàng mới nhất
        const res = await fetchOrderById(orderId);
        const detail = (res as any)?.data ?? res;
        setSelectedOrder(detail);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lấy dữ liệu đơn hàng' });
        // todo: cho phép quét lại sau 2 giây nếu có lỗi xảy ra
        setTimeout(() => setScanned(false), 2000);
      } finally {
        setLoadingOrder(false);
      }

    } else {
      Toast.show({ type: 'error', text1: 'Mã QR không hợp lệ' });
      // todo: reset trạng thái quét sau 3 giây để cho quét lại
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  };

  // TODO: Xử lý đóng modal chi tiết đơn hàng
  const handleCloseModal = () => {
    setSelectedOrder(null);
    // todo: cho phép quét lại sau 2 giây
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  // TODO: Xử lý chuyển tiếp sang màn hình thanh toán
  const handlePayment = () => {
    if (!selectedOrder) return;
    const total = parseFloat(selectedOrder.totalAmount || selectedOrder.total || '0');
    const orderId = selectedOrder.id;
    const customerName = selectedOrder.customerName;
    handleCloseModal();
    navigation.navigate('Payment', {
      orderId: orderId,
      totalAmount: total,
      customerName: customerName,
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Quét mã đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.cameraContainer}>
        <Camera
          style={s.camera}
          cameraType={CameraType.Back}
          scanBarcode={true}
          showFrame={true}
          laserColor={COLORS.primary}
          frameColor="white"
          onReadCode={handleReadCode}
        />
        
        {loadingOrder && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={s.loadingText}>Đang lấy thông tin đơn...</Text>
          </View>
        )}
        
        {!loadingOrder && !selectedOrder && (
          <View style={s.overlay}>
            <View style={s.instructionBox}>
              <QrCode size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={s.instructionText}>
                Di chuyển camera lại gần mã QR trên hóa đơn hoặc ứng dụng để xem chi tiết
              </Text>
            </View>
          </View>
        )}
      </View>

      {selectedOrder && (
        <View style={s.bottomInfo}>
          <OrderBottomSheet 
            order={selectedOrder} 
            onClose={handleCloseModal} 
            onPayment={handlePayment} 
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ScanQRScreen;
