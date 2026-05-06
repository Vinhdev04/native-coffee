/**
 * @file ScanQRScreen.tsx
 * @desc Màn hình quét mã QR để lấy thông tin đơn hàng
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { ChevronLeft, QrCode, Zap } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import Toast from 'react-native-toast-message';

const ScanQRScreen = () => {
  const navigation = useNavigation<any>();
  const [scanned, setScanned] = useState(false);

  const handleReadCode = (event: any) => {
    if (scanned) return;
    
    const qrValue = event.nativeEvent.codeStringValue;
    console.log('Scanned QR:', qrValue);
    
    try {
      const data = JSON.parse(qrValue);
      if (data.action === 'view_order' && data.orderId) {
        setScanned(true);
        Toast.show({
          type: 'success',
          text1: 'Đã nhận diện mã đơn hàng',
          text2: `Đang mở đơn #${data.orderId}`,
        });
        
        // Return to previous screen and navigate to OrderDetail
        navigation.goBack();
        setTimeout(() => {
          navigation.navigate('OrderDetail', { orderId: data.orderId });
        }, 300);
      } else {
        Toast.show({ type: 'error', text1: 'Mã QR không hợp lệ' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Mã QR không đúng định dạng Bill Chips' });
    }
    
    // Reset scanned state after 3s to allow scanning again
    setTimeout(() => {
      setScanned(false);
    }, 3000);
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
        
        <View style={s.overlay}>
          <View style={s.instructionBox}>
            <QrCode size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
            <Text style={s.instructionText}>
              Di chuyển camera lại gần mã QR trên hóa đơn hoặc ứng dụng để xem chi tiết
            </Text>
          </View>
        </View>
      </View>
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
});

export default ScanQRScreen;
