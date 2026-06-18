import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal, ActivityIndicator, TextInput, StyleSheet, Platform, PermissionsAndroid, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { ChevronLeft, QrCode, Keyboard, X } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import Toast from 'react-native-toast-message';
import { OrderBottomSheet } from './OrderScreen';
import { fetchOrderById, fetchTables } from '@/services/orderService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { s } from '../styles/ScanQRScreen.styles';

// TODO: Thành phần chính ScanQRScreen thực hiện quét mã QR qua Camera
const ScanQRScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scanType = route.params?.scanType || 'order'; // 'order' | 'table'

  const { setActiveTable } = useCart();
  const { user } = useAuth();
  
  const branchId = user?.branchId || (user as any)?.branchId || (user as any)?.branch_id || 1;

  // todo: trạng thái quyền Camera
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // todo: trạng thái đã quét thành công hay chưa
  const [scanned, setScanned] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // todo: trạng thái giả lập quét QR
  const [simModalVisible, setSimModalVisible] = useState(false);
  const [simValue, setSimValue] = useState('');

  // Hàm kiểm tra và yêu cầu quyền Camera
  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted) {
          setHasPermission(true);
        } else {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Quyền truy cập Camera',
              message: 'Ứng dụng cần sử dụng camera để quét mã QR.',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Từ chối',
              buttonPositive: 'Đồng ý',
            }
          );
          setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED);
        }
      } else {
        // iOS: Sử dụng trực tiếp NativeModule của react-native-camera-kit
        const RNCameraKitModule = NativeModules.RNCameraKitModule;
        if (RNCameraKitModule) {
          const status = await RNCameraKitModule.checkDeviceCameraAuthorizationStatus();
          if (status === true || status === 1 || String(status) === 'authorized') {
            setHasPermission(true);
          } else {
            const requestStatus = await RNCameraKitModule.requestDeviceCameraAuthorization();
            setHasPermission(requestStatus === true || requestStatus === 1 || String(requestStatus) === 'authorized');
          }
        } else {
          setHasPermission(true); // Fallback
        }
      }
    } catch (err) {
      console.error('[ScanQRScreen] Lỗi kiểm tra quyền camera:', err);
      setHasPermission(true); // Fallback nếu có lỗi xảy ra để tránh treo màn hình
    }
  };

  useEffect(() => {
    checkCameraPermission();
  }, []);

  // TODO: Xử lý chuỗi mã QR chung (cho cả Camera và Giả lập)
  const processQRValue = async (qrValue: string) => {
    if (!qrValue) return;
    setScanned(true);

    if (scanType === 'table') {
      setLoadingOrder(true);
      try {
        let token = qrValue.trim();

        // Phân tích định dạng URL nếu quét link
        if (qrValue.includes('/table/token/')) {
          const parts = qrValue.split('/table/token/');
          if (parts.length > 1) {
            token = parts[1].split('?')[0].split('/')[0];
          }
        } else if (qrValue.includes('/table/')) {
          const parts = qrValue.split('/table/');
          if (parts.length > 1) {
            token = parts[1].split('?')[0].split('/')[0];
          }
        }

        if (token.length < 5) {
          throw new Error('Mã QR bàn quá ngắn hoặc không đúng');
        }

        console.log('[ScanQR] Đang xử lý quét bàn với Token:', token);

        let tableName = `Bàn QR (${token.substring(0, 6)})`;
        let tableId: number | undefined = undefined;

        // Gọi API đối chiếu thông tin bàn ăn
        try {
          const tableRes = await fetchTables(branchId);
          const tablesList: any[] = (tableRes as any)?.data?.rows
            || (tableRes as any)?.data
            || (tableRes as any)?.rows
            || tableRes
            || [];

          const matchedTable = tablesList.find(
            (t: any) => t.qrToken === token || String(t.id) === token || t.name === token
          );

          if (matchedTable) {
            tableName = matchedTable.name;
            tableId = matchedTable.id;
            console.log('[ScanQR] Tìm thấy bàn tương thích:', matchedTable);
          } else {
            console.log('[ScanQR] Không tìm thấy bàn trên hệ thống. Sử dụng token trực tiếp.');
          }
        } catch (tableErr) {
          console.error('[ScanQR] Lỗi đối chiếu thông tin bàn:', tableErr);
        }

        // Cập nhật bàn ăn đang hoạt động vào giỏ hàng
        setActiveTable({
          id: tableId,
          name: tableName,
          qrToken: token,
        });

        Toast.show({
          type: 'success',
          text1: 'Quét bàn thành công',
          text2: `Đã kết nối với ${tableName}`,
        });

        setTimeout(() => {
          navigation.goBack();
        }, 1000);

      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Quét bàn thất bại',
          text2: err.message || 'Mã QR bàn không hợp lệ',
        });
        setTimeout(() => setScanned(false), 2000);
      } finally {
        setLoadingOrder(false);
      }

    } else {
      // Quét đơn hàng (Mặc định)
      let orderId: number | null = null;

      try {
        const data = JSON.parse(qrValue);
        if (data.action === 'view_order' && data.orderId) {
          orderId = Number(data.orderId);
        }
      } catch (e) {
        if (qrValue.includes('/order/')) {
          const parts = qrValue.split('/order/');
          if (parts.length > 1) {
            const potentialId = parts[1].split('?')[0].split('/')[0];
            if (potentialId && !isNaN(Number(potentialId))) {
              orderId = Number(potentialId);
            }
          }
        } else if (!isNaN(Number(qrValue.trim()))) {
          orderId = Number(qrValue.trim());
        }
      }

      if (orderId) {
        setLoadingOrder(true);
        try {
          const res = await fetchOrderById(orderId);
          const detail = (res as any)?.data ?? res;
          setSelectedOrder(detail);
        } catch (err) {
          Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lấy dữ liệu đơn hàng' });
          setTimeout(() => setScanned(false), 2000);
        } finally {
          setLoadingOrder(false);
        }
      } else {
        Toast.show({ type: 'error', text1: 'Mã QR không hợp lệ' });
        setTimeout(() => setScanned(false), 2000);
      }
    }
  };

  // TODO: Xử lý khi camera đọc được mã QR
  const handleReadCode = (event: any) => {
    if (scanned || loadingOrder || selectedOrder) return;
    const qrValue = event.nativeEvent.codeStringValue;
    console.log('Scanned QR:', qrValue);
    processQRValue(qrValue);
  };

  // TODO: Xử lý đóng modal chi tiết đơn hàng
  const handleCloseModal = () => {
    setSelectedOrder(null);
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
        <Text style={s.headerTitle}>
          {scanType === 'table' ? 'Quét mã QR bàn ăn' : 'Quét mã đơn hàng'}
        </Text>
        <TouchableOpacity style={s.backBtn} onPress={() => setSimModalVisible(true)}>
          <Keyboard size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={s.cameraContainer}>
        {hasPermission === true ? (
          <Camera
            style={s.camera}
            cameraType={CameraType.Back}
            scanBarcode={true}
            showFrame={true}
            laserColor={COLORS.primary}
            frameColor="white"
            onReadCode={handleReadCode}
          />
        ) : hasPermission === false ? (
          <View style={[s.camera, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E', padding: 20 }]}>
            <QrCode size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: FONTS.medium, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
              Không có quyền truy cập Camera. Vui lòng cấp quyền trong Cài đặt hệ thống để quét mã QR.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              onPress={checkCameraPermission}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Cấp quyền Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[s.camera, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: '#fff', marginTop: 12, fontFamily: FONTS.medium, fontSize: 14 }}>Đang kiểm tra quyền camera...</Text>
          </View>
        )}
        
        {loadingOrder && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={s.loadingText}>Đang xử lý thông tin...</Text>
          </View>
        )}
        
        {!loadingOrder && !selectedOrder && (
          <View style={s.overlay}>
            <View style={s.instructionBox}>
              <QrCode size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={s.instructionText}>
                {scanType === 'table' 
                  ? 'Di chuyển camera lại gần mã QR được dán trên bàn ăn để kết nối'
                  : 'Di chuyển camera lại gần mã QR trên hóa đơn hoặc ứng dụng để xem chi tiết'
                }
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

      {/* Modal Giả lập quét QR dành cho giả lập / kiểm thử */}
      <Modal
        visible={simModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSimModalVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>Giả lập quét mã QR</Text>
              <TouchableOpacity onPress={() => setSimModalVisible(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={localStyles.label}>
              Nhập mã QR hoặc link để giả lập hành động quét:
            </Text>

            <TextInput
              style={localStyles.input}
              placeholder={scanType === 'table' ? 'Ví dụ: f47ac10b-58cc-4372-a567-0e02b2c3d479' : 'Ví dụ: 1 hoặc JSON'}
              value={simValue}
              onChangeText={setSimValue}
              autoFocus
            />

            <View style={localStyles.buttonGroup}>
              {scanType === 'table' && (
                <View style={localStyles.recommendSection}>
                  <Text style={localStyles.recommendLabel}>Mẫu Token bàn test:</Text>
                  <View style={localStyles.tagRow}>
                    <TouchableOpacity 
                      style={localStyles.tag} 
                      onPress={() => setSimValue('f47ac10b-58cc-4372-a567-0e02b2c3d479')}
                    >
                      <Text style={localStyles.tagText}>Token Bàn A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={localStyles.tag} 
                      onPress={() => setSimValue('Bàn A1')}
                    >
                      <Text style={localStyles.tagText}>Tên Bàn A1</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={localStyles.confirmBtn}
                onPress={() => {
                  setSimModalVisible(false);
                  processQRValue(simValue);
                }}
              >
                <Text style={localStyles.confirmBtnText}>Xác nhận quét</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  buttonGroup: {
    marginTop: 8,
  },
  recommendSection: {
    marginBottom: 16,
  },
  recommendLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScanQRScreen;
