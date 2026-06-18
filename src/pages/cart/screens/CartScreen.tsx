import React, { useState } from 'react';
import {
  View, Text, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
  Platform, StatusBar, ScrollView, Modal, TextInput, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { ChevronLeft, Trash2, Plus, Minus, Ticket, ChevronRight, FileText, ShoppingBag, X, CheckCircle2, QrCode } from 'lucide-react-native';
import { createOrder, fetchActiveShiftSession, fetchTables, createQrOrder } from '@/services/orderService';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/context/AuthContext';
import { orderCache } from '@/utils/orderCache';
import { useTranslation } from 'react-i18next';
import ProductModal from '@/components/menu/ProductModal';
import ReceiptModal from '@/components/common/ReceiptModal';
import { Printer } from 'lucide-react-native';
import { s } from '../styles/CartScreen.styles';

// todo: Danh sách các mã giảm giá mặc định của hệ thống
const VOUCHERS = [
  { id: '1', code: 'COFFEE5', value: 5000, desc: 'Giảm ngay 5.000đ cho đơn hàng' },
  { id: '2', code: 'COFFEE10', value: 10000, desc: 'Giảm ngay 10.000đ cho đơn hàng' },
];

// TODO: Thành phần chính CartScreen quản lý giỏ hàng, tính toán VAT, giảm giá và đặt hàng
const CartScreen = () => {
  const { width } = useWindowDimensions();
  // todo: kiểm tra màn hình nhỏ
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart, updateNote, updateItem, activeTable, setActiveTable, clearActiveTable } = useCart();
  const { user } = useAuth();
  const branchId = user?.branchId || (user as any)?.branchId || (user as any)?.branch_id || 1;
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesModalVisible, setTablesModalVisible] = useState(false);

  // todo: Lấy danh sách bàn từ API
  const handleOpenTablesModal = async () => {
    setTablesModalVisible(true);
    setTablesLoading(true);
    try {
      const res = await fetchTables(branchId);
      const rows = (res as any)?.data?.rows || (res as any)?.data || (res as any)?.rows || res || [];
      setTables(rows.filter((t: any) => t.isActive === '1' || t.isActive === 1 || t.isActive === undefined));
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bàn:', err);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách bàn ăn' });
    } finally {
      setTablesLoading(false);
    }
  };
  
  // todo: Trạng thái và loại thuế suất áp dụng
  const [vatType, setVatType] = useState<'exclusive' | 'inclusive' | 'none'>('inclusive');
  const [vatRate, setVatRate] = useState<string>('8');
  
  // todo: Các trạng thái modal nhập ghi chú
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any>(null);
  const [tempNote, setTempNote] = useState('');

  // todo: Trạng thái modal mã giảm giá
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);

  // todo: Trạng thái modal chỉnh sửa thuộc tính sản phẩm
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // todo: Trạng thái hiển thị xem trước hóa đơn
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);

  const discount = selectedVoucher ? selectedVoucher.value : 0;
  const subtotalAfterDiscount = Math.max(0, totalPrice - discount);
  
  const vatRateNumber = parseFloat(vatRate) || 0;
  let vatAmount = 0;
  let grandTotal = subtotalAfterDiscount;

  // todo: Tính toán giá trị thuế suất theo tùy chọn
  if (vatType === 'exclusive') {
    vatAmount = subtotalAfterDiscount * (vatRateNumber / 100);
    grandTotal = subtotalAfterDiscount + vatAmount;
  } else if (vatType === 'inclusive') {
    vatAmount = subtotalAfterDiscount * (vatRateNumber / (100 + vatRateNumber));
    grandTotal = subtotalAfterDiscount;
  }

  // TODO: Xử lý quá trình thanh toán đơn hàng (checkout)
  const handleCheckout = async () => {
    if (items.length === 0) {
      console.warn('[CartScreen] handleCheckout — giỏ hàng đang trống');
      return;
    }

    try {
      setIsCheckingOut(true);

      const customerName = user?.fullName || (user as any)?.full_name
        || user?.username || (user as any)?.name
        || 'Khách vãng lai';
      
      let res: any = null;

      // Phân biệt luồng: Nếu chọn bàn bằng QR Token (Luồng khách hàng)
      if (activeTable?.qrToken && !activeTable.id) {
        const qrPayload = {
          qrToken: activeTable.qrToken,
          items: items.map(item => ({
            productId: Number(item.id),
            selectedProductAttributeIds: item.selectedAttributes?.map((a: any) => Number(a.id)).filter((id: number) => !isNaN(id)) || [],
            qty: item.quantity,
            note: item.note || '',
          })),
          note: selectedVoucher ? `Voucher: ${selectedVoucher.code} (-${formatCurrency(selectedVoucher.value)})` : '',
        };
        console.log('[CartScreen] Gửi đơn hàng qua QR Token:', JSON.stringify(qrPayload, null, 2));
        res = await createQrOrder(qrPayload);

      } else {
        // Luồng nhân viên/mặc định (có hoặc không có tableId)
        let shiftSessionId: number | null = null;
        try {
          const shiftRes = await fetchActiveShiftSession(branchId);
          const shifts: any[] = (shiftRes as any)?.data?.rows
            || (shiftRes as any)?.data
            || (shiftRes as any)?.rows
            || shiftRes
            || [];

          const shiftArr = Array.isArray(shifts) ? shifts : [shifts];
          const activeShift = shiftArr.find((s: any) => s.status === 'OPEN' || s.isActive) || shiftArr[0];

          if (activeShift) {
            shiftSessionId = activeShift.id;
          }
        } catch (shiftErr) {
          console.error('[CartScreen] Lỗi fetchActiveShiftSession:', shiftErr);
        }

        const payload: any = {
          branchId,
          ...(shiftSessionId ? { shiftSessionId } : {}),
          ...(activeTable?.id ? { tableId: activeTable.id } : {}),
          customerName,
          note: selectedVoucher ? `Voucher: ${selectedVoucher.code} (-${formatCurrency(selectedVoucher.value)})` : '',
          items: items.map(item => ({
            productId: Number(item.id),
            selectedProductAttributeIds: item.selectedAttributes?.map((a: any) => Number(a.id)).filter((id: number) => !isNaN(id)) || [],
            qty: item.quantity,
            note: item.note || '',
          })),
        };
        console.log('[CartScreen] Gửi tạo đơn hàng tiêu chuẩn:', JSON.stringify(payload, null, 2));
        res = await createOrder(payload);
      }

      console.log('[CartScreen] Phản hồi tạo đơn hàng:', JSON.stringify(res, null, 2));

      const newOrderId = (res as any)?.data?.id
        || (res as any)?.id
        || (res as any)?.data?.orderId;

      console.log(`[CartScreen] Đã tạo đơn hàng — orderId=${newOrderId}`);
      if (newOrderId) {
        orderCache.setCount(newOrderId, items.length);
        Toast.show({ type: 'success', text1: t('order_success_title'), text2: t('order_success_desc', { id: newOrderId }) });
        clearCart();
        clearActiveTable();
        navigation.navigate('OrderDetail', { orderId: newOrderId });
      } else {
        console.warn('[CartScreen] Không có orderId trong phản hồi, đang chuyển hướng đến OrdersTab');
        clearCart();
        clearActiveTable();
        navigation.navigate('Main', { screen: 'OrdersTab' });
      }
    } catch (error: any) {
      console.error('[CartScreen] Lỗi handleCheckout:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi đặt hàng',
        text2: error?.response?.data?.error_cont || error?.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  // TODO: Mở cửa sổ nhập ghi chú cho sản phẩm
  const openNoteModal = (item: any) => {
    setCurrentEditingItem(item);
    setTempNote(item.note || '');
    setNoteModalVisible(true);
  };

  // TODO: Lưu ghi chú tạm thời vào sản phẩm trong giỏ hàng
  const saveNote = () => {
    if (currentEditingItem) {
      updateNote(currentEditingItem.cartId, tempNote);
    }
    setNoteModalVisible(false);
  };

  // TODO: Mở cửa sổ chỉnh sửa thông tin/options của sản phẩm
  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  // TODO: Lưu cập nhật thay đổi thuộc tính của sản phẩm
  const onUpdateItem = (updatedItem: any) => {
    if (editingItem) {
      updateItem(editingItem.cartId, {
        ...editingItem,
        ...updatedItem,
        cartId: `${updatedItem.id}-${updatedItem.selectedAttributes?.map((a: any) => a.id).join('-') || 'default'}`,
      });
    }
  };

  // TODO: Render một phần tử sản phẩm trong danh sách giỏ hàng
  const renderItem = (item: any, isLast: boolean) => (
    <TouchableOpacity 
      key={item.cartId} 
      style={[s.cartItem, isLast && { borderBottomWidth: 0 }]}
      onPress={() => handleEditItem(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' }} 
        style={s.image} 
      />
      <View style={s.itemInfo}>
        <View style={s.titleRow}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={s.itemPrice}>{formatCurrency(item.price)}</Text>
        </View>
        
        <Text style={s.itemAttributes} numberOfLines={1}>
          {item.selectedAttributes?.map((a: any) => a.name).join(', ') || 'Mặc định'}
        </Text>
        
        <View style={s.itemActions}>
          <TouchableOpacity 
            style={[s.noteBtn, item.note ? s.noteBtnActive : {}]} 
            onPress={() => openNoteModal(item)}
          >
            <FileText size={12} color={item.note ? COLORS.primary : COLORS.textMuted} />
            <Text style={[s.noteBtnText, item.note ? { color: COLORS.primary } : {}]} numberOfLines={1}>
              {item.note || t('add_note')}
            </Text>
          </TouchableOpacity>

          <View style={s.qtyControls}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.cartId, Math.max(0, item.quantity - 1))}>
              <Minus size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.qtyText}>{item.quantity}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.cartId, item.quantity + 1)}>
              <Plus size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => removeItem(item.cartId)} style={s.deleteBtn}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={s.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[s.header, { paddingHorizontal: isSmallScreen ? 12 : 20 }]}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('cart.title')}</Text>
          <View style={s.headerRight}>
            <TouchableOpacity 
              style={s.headerBtn} 
              onPress={() => setIsReceiptVisible(true)}
            >
              <Printer size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {items.length > 0 ? (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
              <View style={s.mainContainer}>
                {/* Items Section */}
                <View style={s.itemsSection}>
                  {items.map((item, index) => renderItem(item, index === items.length - 1))}
                </View>

                {/* Table Section */}
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <QrCode size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary }}>Thông tin Bàn ăn</Text>
                    </View>
                    {activeTable && (
                      <TouchableOpacity onPress={clearActiveTable}>
                        <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '500' }}>Xóa bàn</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {activeTable ? (
                    <View style={{
                      backgroundColor: '#FFF5F0',
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#FFE0CC',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#D44A00' }}>
                          {activeTable.name || 'Bàn quét QR'}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }} numberOfLines={1}>
                          {activeTable.qrToken ? `Token: ${activeTable.qrToken.substring(0, 16)}...` : 'Gán trực tiếp bởi nhân viên'}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={{
                          backgroundColor: '#fff',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#FFE0CC',
                        }}
                        onPress={handleOpenTablesModal}
                      >
                        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>Đổi bàn</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity 
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          paddingVertical: 12,
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                        }}
                        onPress={handleOpenTablesModal}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>Chọn bàn</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: COLORS.primary + '15',
                          borderRadius: 8,
                          paddingVertical: 12,
                          borderWidth: 1,
                          borderColor: COLORS.primary + '40',
                        }}
                        onPress={() => navigation.navigate('ScanQR', { scanType: 'table' })}
                        activeOpacity={0.7}
                      >
                        <QrCode size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.primary }}>Quét QR bàn</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Voucher section */}
                <TouchableOpacity style={s.voucherCard} onPress={() => setVoucherModalVisible(true)}>
                  <View style={s.voucherIconContainer}>
                    <Ticket size={20} color={COLORS.primary} />
                  </View>
                  <View style={s.voucherTextContainer}>
                    <Text style={s.voucherTitle}>
                      {selectedVoucher ? `Mã: ${selectedVoucher.code}` : t('voucher_title')}
                    </Text>
                    <Text style={s.voucherSubtitle}>
                      {selectedVoucher ? `Tiết kiệm ${formatCurrency(selectedVoucher.value)}` : t('select_voucher')}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* VAT section */}
                <View style={s.vatCard}>
                  <View style={s.vatHeader}>
                    <FileText size={18} color={COLORS.primary} />
                    <Text style={s.vatTitle}>{t('vat_title')}</Text>
                  </View>
                  <View style={s.vatOptions}>
                    <TouchableOpacity
                      style={[s.vatOptionBtn, vatType === 'inclusive' && s.vatOptionActive]}
                      onPress={() => setVatType('inclusive')}
                    >
                      <Text style={[s.vatOptionText, vatType === 'inclusive' && s.vatOptionTextActive]} adjustsFontSizeToFit numberOfLines={1}>{t('vat_inclusive')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.vatOptionBtn, vatType === 'exclusive' && s.vatOptionActive]}
                      onPress={() => setVatType('exclusive')}
                    >
                      <Text style={[s.vatOptionText, vatType === 'exclusive' && s.vatOptionTextActive]} adjustsFontSizeToFit numberOfLines={1}>{t('vat_exclusive')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.vatOptionBtn, vatType === 'none' && s.vatOptionActive]}
                      onPress={() => setVatType('none')}
                    >
                      <Text style={[s.vatOptionText, vatType === 'none' && s.vatOptionTextActive]} adjustsFontSizeToFit numberOfLines={1}>{t('vat_none')}</Text>
                    </TouchableOpacity>
                  </View>
                  {vatType === 'exclusive' && (
                    <View style={s.vatInputRow}>
                      <Text style={s.vatInputLabel}>Nhập phần trăm (%) Thuế suất:</Text>
                      <View style={s.vatInputWrapper}>
                        <TextInput
                          style={s.vatInput}
                          keyboardType="numeric"
                          value={vatRate}
                          onChangeText={setVatRate}
                          maxLength={2}
                        />
                        <Text style={s.vatPercentIcon}>%</Text>
                      </View>
                    </View>
                  )}
                  {vatType === 'inclusive' && (
                    <View style={s.vatInputRow}>
                      <Text style={s.vatInputLabel}>Thuế suất hệ thống đang áp dụng:</Text>
                      <Text style={s.vatFixedText}>{vatRate}%</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Bottom Footer */}
            <View style={s.footer}>
              <View style={s.footerTop}>
                <View>
                  <Text style={s.footerTotalLabel}>{t('payment_total')}</Text>
                  <Text style={s.footerTotalValue}>{formatCurrency(grandTotal)}</Text>
                </View>
                <View style={s.footerItemCount}>
                   <Text style={s.footerItemCountText}>{t('item_count', { count: totalItems })}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[s.checkoutBtn, isCheckingOut && { opacity: 0.7 }]} 
                onPress={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={s.checkoutText}>{t('checkout_now')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconCircle}>
              <ShoppingBag size={50} color={COLORS.primary} />
            </View>
            <Text style={s.emptyTitle}>{t('empty_cart_title')}</Text>
            <Text style={s.emptySubtitle}>{t('empty_cart_subtitle')}</Text>
            <TouchableOpacity 
              style={s.shopBtn} 
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={s.shopBtnText}>{t('continue_shopping')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Note Modal */}
        <Modal
          visible={noteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNoteModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.noteModalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{t('add_note')}</Text>
                <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <Text style={s.modalProductName}>{currentEditingItem?.name}</Text>
              
              <TextInput
                style={s.noteInput}
                placeholder={t('note_placeholder')}
                multiline
                numberOfLines={4}
                value={tempNote}
                onChangeText={setTempNote}
                textAlignVertical="top"
                autoFocus
              />
              
              <TouchableOpacity style={s.saveNoteBtn} onPress={saveNote}>
                <Text style={s.saveNoteText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Voucher Modal */}
        <Modal
          visible={voucherModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setVoucherModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.voucherModalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Chọn Voucher</Text>
                <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={s.voucherList}>
                {VOUCHERS.map((v) => (
                  <TouchableOpacity 
                    key={v.id} 
                    style={[s.voucherOption, selectedVoucher?.id === v.id && s.voucherOptionActive]}
                    onPress={() => {
                      setSelectedVoucher(v);
                      setVoucherModalVisible(false);
                    }}
                  >
                    <View style={s.voucherOptionInfo}>
                      <View style={s.voucherBadge}>
                        <Text style={s.voucherBadgeText}>{v.code}</Text>
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={s.voucherOptionTitle}>{v.desc}</Text>
                        <Text style={s.voucherOptionValue}>Giảm {formatCurrency(v.value)}</Text>
                      </View>
                    </View>
                    {selectedVoucher?.id === v.id && (
                      <CheckCircle2 size={24} color={COLORS.primary} fill="#FFF0E6" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {selectedVoucher && (
                <TouchableOpacity 
                  style={s.removeVoucherBtn} 
                  onPress={() => {
                    setSelectedVoucher(null);
                    setVoucherModalVisible(false);
                  }}
                >
                  <Text style={s.removeVoucherText}>Hủy áp dụng</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        {/* Product Edit Modal */}
        <ProductModal 
          visible={editModalVisible}
          product={editingItem}
          initialData={editingItem}
          onClose={() => setEditModalVisible(false)}
          onAddToCart={onUpdateItem}
        />

        <ReceiptModal
          visible={isReceiptVisible}
          onClose={() => setIsReceiptVisible(false)}
          order={{ 
            items, 
            totalPrice, 
            discount,
            vatAmount,
            vatRate: vatRateNumber,
            vatType,
            grandTotal,
            customerName: user?.fullName || 'Khách vãng lai' 
          }}
        />

        {/* Table Selection Modal */}
        <Modal
          visible={tablesModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setTablesModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.voucherModalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Chọn bàn ăn</Text>
                <TouchableOpacity onPress={() => setTablesModalVisible(false)}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {tablesLoading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Đang tải danh sách bàn...</Text>
                </View>
              ) : tables.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.textMuted }}>Không tìm thấy bàn nào hoạt động</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 20 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 }}>
                    {tables.map((t: any) => {
                      const isSelected = activeTable?.id === t.id;
                      const isBusy = t.status === 'ORDERED';
                      return (
                        <TouchableOpacity
                          key={t.id}
                          style={{
                            width: (width - 40 - 20) / 3,
                            aspectRatio: 1,
                            borderRadius: 16,
                            backgroundColor: isSelected ? '#FFF0E6' : '#F9FAFB',
                            borderWidth: 1.5,
                            borderColor: isSelected ? COLORS.primary : isBusy ? '#FFE0CC' : '#E5E7EB',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 8,
                            position: 'relative',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isSelected ? 0.05 : 0.02,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                          onPress={() => {
                            setActiveTable({
                              id: t.id,
                              name: t.name,
                              qrToken: t.qrToken,
                            });
                            setTablesModalVisible(false);
                          }}
                        >
                          {isSelected && (
                            <View style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              backgroundColor: COLORS.primary,
                              borderRadius: 10,
                              width: 16,
                              height: 16,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <CheckCircle2 size={12} color="#fff" />
                            </View>
                          )}
                          
                          <Text style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: isSelected ? COLORS.primary : COLORS.textPrimary,
                            textAlign: 'center',
                            marginBottom: 6,
                          }} numberOfLines={1}>
                            {t.name}
                          </Text>
                          
                          <View style={{
                            backgroundColor: isBusy ? '#FFEAE0' : '#E6F4EA',
                            borderRadius: 8,
                            paddingVertical: 3,
                            paddingHorizontal: 8,
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: isBusy ? '#FF5500' : '#137333',
                            }}>
                              {isBusy ? 'Bận' : 'Trống'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default CartScreen;
