import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, SafeAreaView, ActivityIndicator,
  Platform, StatusBar, ScrollView, Modal, TextInput, Alert
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { ChevronLeft, Trash2, Plus, Minus, Ticket, ChevronRight, FileText, ShoppingBag, X, CheckCircle2 } from 'lucide-react-native';
import { createOrder, fetchActiveShiftSession } from '@/services/orderService';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/context/AuthContext';
import { orderCache } from '@/utils/orderCache';
import ProductModal from '@/components/menu/ProductModal';
import ReceiptModal from '@/components/common/ReceiptModal';
import { Printer, QrCode } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

const VOUCHERS = [
  { id: '1', code: 'COFFEE5', value: 5000, desc: 'Giảm ngay 5.000đ cho đơn hàng' },
  { id: '2', code: 'COFFEE10', value: 10000, desc: 'Giảm ngay 10.000đ cho đơn hàng' },
];

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart, updateNote, updateItem } = useCart();
  const { user } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  
  // Note Modal State
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any>(null);
  const [tempNote, setTempNote] = useState('');

  // Voucher Modal State
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Receipt Modal State
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);

  const discount = selectedVoucher ? selectedVoucher.value : 0;
  const grandTotal = Math.max(0, totalPrice - discount);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      setIsCheckingOut(true);
      let shiftSessionId: number | null = null;
      try {
        const shiftRes = await fetchActiveShiftSession(1);
        const shifts: any[] = (shiftRes as any)?.data?.rows || (shiftRes as any)?.data || (shiftRes as any)?.rows || shiftRes || [];
        const shiftArr = Array.isArray(shifts) ? shifts : [shifts];
        const activeShift = shiftArr.find((s: any) => s.status === 'OPEN' || s.isActive) || shiftArr[0];
        if (activeShift) shiftSessionId = activeShift.id;
      } catch (shiftErr) {
        console.error('fetchActiveShiftSession error:', shiftErr);
      }

      const customerName = user?.fullName || (user as any)?.full_name || user?.username || 'Khách vãng lai';
      const payload: any = {
        branchId: 1,
        ...(shiftSessionId ? { shiftSessionId } : {}),
        customerName,
        note: selectedVoucher ? `Voucher: ${selectedVoucher.code} (-${formatCurrency(selectedVoucher.value)})` : '',
        items: items.map(item => ({
          productId: Number(item.id),
          selectedProductAttributeIds: item.selectedAttributes?.map((a: any) => Number(a.id)).filter((id: number) => !isNaN(id)) || [],
          qty: item.quantity,
          note: item.note || '',
        })),
      };

      const res = await createOrder(payload);
      const newOrderId = (res as any)?.data?.id || (res as any)?.id || (res as any)?.data?.orderId;

      if (newOrderId) {
        orderCache.setCount(newOrderId, items.length);
        Toast.show({ type: 'success', text1: '🎉 Đặt hàng thành công!', text2: `Đơn #${newOrderId} đang được xử lý.` });
        clearCart();
        navigation.navigate('OrderDetail', { orderId: newOrderId });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi đặt hàng',
        text2: error?.response?.data?.error_cont || error?.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const openNoteModal = (item: any) => {
    setCurrentEditingItem(item);
    setTempNote(item.note || '');
    setNoteModalVisible(true);
  };

  const saveNote = () => {
    if (currentEditingItem) {
      updateNote(currentEditingItem.cartId, tempNote);
    }
    setNoteModalVisible(false);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const onUpdateItem = (updatedItem: any) => {
    if (editingItem) {
      updateItem(editingItem.cartId, {
        ...editingItem,
        ...updatedItem,
        cartId: `${updatedItem.id}-${updatedItem.selectedAttributes?.map((a: any) => a.id).join('-') || 'default'}`,
      });
    }
  };

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
              {item.note || 'Ghi chú'}
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
        <View style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Giỏ Hàng</Text>
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


                {/* Voucher section */}
                <TouchableOpacity style={s.voucherCard} onPress={() => setVoucherModalVisible(true)}>
                  <View style={s.voucherIconContainer}>
                    <Ticket size={20} color={COLORS.primary} />
                  </View>
                  <View style={s.voucherTextContainer}>
                    <Text style={s.voucherTitle}>
                      {selectedVoucher ? `Mã: ${selectedVoucher.code}` : 'Voucher giảm giá'}
                    </Text>
                    <Text style={s.voucherSubtitle}>
                      {selectedVoucher ? `Tiết kiệm ${formatCurrency(selectedVoucher.value)}` : 'Chọn mã giảm giá'}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Bottom Footer */}
            <View style={s.footer}>
              <View style={s.footerTop}>
                <View>
                  <Text style={s.footerTotalLabel}>Số tiền cần trả</Text>
                  <Text style={s.footerTotalValue}>{formatCurrency(grandTotal)}</Text>
                </View>
                <View style={s.footerItemCount}>
                   <Text style={s.footerItemCountText}>{totalItems} món</Text>
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
                  <Text style={s.checkoutText}>Đặt hàng ngay</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconCircle}>
              <ShoppingBag size={50} color={COLORS.primary} />
            </View>
            <Text style={s.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
            <Text style={s.emptySubtitle}>Hãy quay lại thực đơn để chọn những thức uống tuyệt vời nhé!</Text>
            <TouchableOpacity 
              style={s.shopBtn} 
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={s.shopBtnText}>Tiếp tục mua sắm</Text>
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
                <Text style={s.modalTitle}>Thêm ghi chú</Text>
                <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <Text style={s.modalProductName}>{currentEditingItem?.name}</Text>
              
              <TextInput
                style={s.noteInput}
                placeholder="Ví dụ: Ít đường, nhiều đá, không béo..."
                multiline
                numberOfLines={4}
                value={tempNote}
                onChangeText={setTempNote}
                textAlignVertical="top"
                autoFocus
              />
              
              <TouchableOpacity style={s.saveNoteBtn} onPress={saveNote}>
                <Text style={s.saveNoteText}>Xác nhận</Text>
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
          order={{ items, totalPrice, customerName: user?.fullName || 'Khách vãng lai' }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: Platform.OS === 'android' ? 10 : 15,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  headerBtn: { 
    width: 38, height: 38, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#F9FAFB', borderRadius: 12,
  },
  headerRight: { minWidth: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  itemBadge: { backgroundColor: '#FFF0E6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  itemBadgeText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.primary },

  listContent: { paddingBottom: 150 },
  sectionDivider: { height: 8, backgroundColor: '#F9FAFB' },
  
  itemsSection: { backgroundColor: COLORS.white },
  cartItem: {
    flexDirection: 'row', padding: 10, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center',
  },
  image: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F9FAFB' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  itemAttributes: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  itemActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 2 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 8 },
  qtyText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, paddingHorizontal: 10 },
  noteBtn: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    flex: 1, marginRight: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E5E7EB'
  },
  noteBtnActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary, borderStyle: 'solid' },
  noteBtnText: { marginLeft: 4, fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted },

  voucherCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.white, marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  voucherIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center' },
  voucherTextContainer: { flex: 1, marginLeft: 12 },
  voucherTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  voucherSubtitle: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: COLORS.white, 
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  footerTotalLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  footerTotalValue: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },
  footerItemCount: { backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  footerItemCountText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textPrimary },
  checkoutBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  checkoutText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 10 },
  shopBtn: { marginTop: 30, backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 14 },
  shopBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  noteModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  noteInput: { 
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12, height: 100, 
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  saveNoteBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveNoteText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  voucherModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  voucherOption: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6'
  },
  voucherOptionActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary },
  voucherOptionInfo: { flex: 1 },
  voucherOptionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  voucherOptionValue: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.primary },
  removeVoucherBtn: { paddingVertical: 10, alignItems: 'center' },
  removeVoucherText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.error },
});

export default CartScreen;
