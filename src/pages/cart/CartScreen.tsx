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

const VOUCHERS = [
  { id: '1', code: 'COFFEE5', value: 5000, desc: 'Giảm ngay 5.000đ cho đơn hàng' },
  { id: '2', code: 'COFFEE10', value: 10000, desc: 'Giảm ngay 10.000đ cho đơn hàng' },
];

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart, updateNote } = useCart();
  const { user } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  
  // Note Modal State
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any>(null);
  const [tempNote, setTempNote] = useState('');

  // Voucher Modal State
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);

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

  const renderItem = (item: any, isLast: boolean) => (
    <View key={item.cartId} style={[s.cartItem, isLast && { borderBottomWidth: 0 }]}>
      <Image 
        source={{ uri: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' }} 
        style={s.image} 
      />
      <View style={s.itemInfo}>
        <View style={s.titleRow}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeItem(item.cartId)} style={s.deleteBtn}>
            <Trash2 size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        
        <Text style={s.itemAttributes}>
          Size {item.selectedAttributes?.find((a: any) => a.type?.toLowerCase() === 'size')?.name || 'M'}
          {item.selectedAttributes?.filter((a: any) => a.type?.toLowerCase() === 'topping').map((a: any) => `, ${a.name}`).join('')}
        </Text>
        
        <TouchableOpacity 
          style={[s.noteBtn, item.note ? s.noteBtnActive : {}]} 
          onPress={() => openNoteModal(item)}
        >
          <FileText size={12} color={item.note ? COLORS.primary : COLORS.textMuted} />
          <Text style={[s.noteBtnText, item.note ? { color: COLORS.primary } : {}]} numberOfLines={1}>
            {item.note || 'Thêm ghi chú...'}
          </Text>
        </TouchableOpacity>

        <View style={s.priceQtyRow}>
          <View style={s.quantityControl}>
            <TouchableOpacity 
              style={s.qtyBtn} 
              onPress={() => updateQuantity(item.cartId, Math.max(0, item.quantity - 1))}
            >
              <Minus size={12} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.qtyText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={s.qtyBtn} 
              onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
            >
              <Plus size={12} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={s.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
        </View>
      </View>
    </View>
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
            <View style={s.itemBadge}>
              <Text style={s.itemBadgeText}>{totalItems} món</Text>
            </View>
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

                <View style={s.sectionDivider} />

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

                <View style={s.sectionDivider} />

                {/* Summary section */}
                <View style={s.summaryCard}>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Tạm tính ({totalItems} món)</Text>
                    <Text style={s.summaryValueText}>{formatCurrency(totalPrice)}</Text>
                  </View>
                  {discount > 0 && (
                    <View style={s.summaryRow}>
                      <Text style={[s.summaryLabel, { color: COLORS.error }]}>Khuyến mãi</Text>
                      <Text style={[s.summaryValueText, { color: COLORS.error }]}>-{formatCurrency(discount)}</Text>
                    </View>
                  )}
                  <View style={s.divider} />
                  <View style={s.summaryRow}>
                    <Text style={s.grandTotalLabel}>Tổng cộng</Text>
                    <Text style={s.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
                  </View>
                </View>
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  headerBtn: { 
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: COLORS.white, borderRadius: 14,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  headerRight: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
  itemBadge: { backgroundColor: '#FFF0E6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  itemBadgeText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },

  scrollContent: { padding: 16, paddingBottom: 40 },
  mainContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  itemsSection: { padding: 16 },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  image: { width: 90, height: 90, borderRadius: 20, backgroundColor: '#F9FAFB' },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { flex: 1, fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  deleteBtn: { padding: 6, backgroundColor: '#F9FAFB', borderRadius: 10 },
  itemAttributes: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  noteBtn: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginTop: 8,
    maxWidth: '90%', borderStyle: 'dashed', borderWidth: 1, borderColor: '#E5E7EB'
  },
  noteBtnActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary, borderStyle: 'solid' },
  noteBtnText: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, marginLeft: 6 },
  
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.primary },
  quantityControl: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 12, padding: 3, borderWidth: 1, borderColor: '#F3F4F6',
  },
  qtyBtn: { 
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: COLORS.white, borderRadius: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1,
  },
  qtyText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, paddingHorizontal: 10 },

  sectionDivider: { height: 8, backgroundColor: '#F9FAFB' },

  voucherCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: COLORS.white,
  },
  voucherIconContainer: { 
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF0E6', 
    justifyContent: 'center', alignItems: 'center' 
  },
  voucherTextContainer: { flex: 1, marginLeft: 15 },
  voucherTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  voucherSubtitle: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  summaryCard: { padding: 20, backgroundColor: COLORS.white },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  summaryValueText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  grandTotalLabel: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary },
  grandTotalValue: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, backgroundColor: COLORS.white, 
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.08, shadowRadius: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  footerTotalLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  footerTotalValue: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary },
  footerItemCount: { backgroundColor: '#F9FAFB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  footerItemCountText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textPrimary },
  
  checkoutBtn: { 
    backgroundColor: COLORS.primary, height: 58, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  checkoutText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  shopBtn: { marginTop: 35, backgroundColor: COLORS.primary, paddingHorizontal: 35, paddingVertical: 14, borderRadius: 16, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  shopBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  noteModalContent: { 
    backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, 
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 45 : 30 
  },
  voucherModalContent: { 
    backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, 
    padding: 24, maxHeight: '80%', paddingBottom: Platform.OS === 'ios' ? 45 : 30 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  modalProductName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textMuted, marginBottom: 15 },
  noteInput: { 
    backgroundColor: '#F9FAFB', borderRadius: 20, padding: 15, height: 120, 
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  saveNoteBtn: { backgroundColor: COLORS.primary, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveNoteText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  
  voucherList: { marginBottom: 20 },
  voucherOption: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, backgroundColor: '#F9FAFB', borderRadius: 20, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  voucherOptionActive: { backgroundColor: '#FFF0E6', borderColor: COLORS.primary },
  voucherOptionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  voucherBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  voucherBadgeText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.white },
  voucherOptionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  voucherOptionValue: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.primary, marginTop: 2 },
  removeVoucherBtn: { paddingVertical: 10, alignItems: 'center' },
  removeVoucherText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.error },
});

export default CartScreen;
