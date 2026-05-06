/**
 * @file ScanQRScreen.tsx
 * @desc Màn hình quét mã QR để lấy thông tin đơn hàng
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { ChevronLeft, QrCode, Zap } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import Toast from 'react-native-toast-message';
import { OrderBottomSheet } from './OrderScreen';
import { fetchOrderById } from '@/services/orderService';

const ScanQRScreen = () => {
  const navigation = useNavigation<any>();
  const [scanned, setScanned] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleReadCode = async (event: any) => {
    if (scanned || loadingOrder || selectedOrder) return;
    
    const qrValue = event.nativeEvent.codeStringValue;
    console.log('Scanned QR:', qrValue);
    
    let orderId = null;

    try {
      // 1. Cố gắng parse theo định dạng JSON cũ (Backward compatibility)
      const data = JSON.parse(qrValue);
      if (data.action === 'view_order' && data.orderId) {
        orderId = data.orderId;
      }
    } catch (e) {
      // 2. Nếu không phải JSON, kiểm tra xem có phải định dạng URL mới không
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
        const res = await fetchOrderById(orderId);
        const detail = (res as any)?.data ?? res;
        setSelectedOrder(detail);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lấy dữ liệu đơn hàng' });
        // Cho quét lại ngay nếu lỗi
        setTimeout(() => setScanned(false), 2000);
      } finally {
        setLoadingOrder(false);
      }

    } else {
      Toast.show({ type: 'error', text1: 'Mã QR không hợp lệ' });
      // Reset scanned state after 3s to allow scanning again
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    // Cho phép quét lại sau 2 giây đóng Modal
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

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

      <Modal visible={!!selectedOrder} transparent animationType="slide" onRequestClose={handleCloseModal}>
        {selectedOrder && (
          <OrderBottomSheet order={selectedOrder} onClose={handleCloseModal} onPayment={handlePayment} />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1A1A2E',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    alignItems: 'center',
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  instructionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FONTS.medium,
    color: '#fff',
    fontSize: 15,
  }
});

export default ScanQRScreen;
