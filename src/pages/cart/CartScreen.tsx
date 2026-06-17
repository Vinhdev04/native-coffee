import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, SafeAreaView, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, BORDER_RADIUS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { createOrder, fetchActiveShiftSession } from '@/services/orderService';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/context/AuthContext';

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      console.warn('[CartScreen] handleCheckout — giỏ hàng đang trống');
      return;
    }

    try {
      setIsCheckingOut(true);

      // ── Bước 1: Lấy phiên ca làm việc đang hoạt động ─────────────────────────────────
      console.log('[CartScreen] Đang lấy phiên ca làm việc đang hoạt động...');
      let shiftSessionId: number | null = null;

      try {
        const shiftRes = await fetchActiveShiftSession(1);
        console.log('[CartScreen] Phản hồi thô của shiftSession:', JSON.stringify(shiftRes, null, 2));

        // API response có thể là array hoặc {data: [...]}
        const shifts: any[] = (shiftRes as any)?.data?.rows
          || (shiftRes as any)?.data
          || (shiftRes as any)?.rows
          || shiftRes
          || [];

        const shiftArr = Array.isArray(shifts) ? shifts : [shifts];
        const activeShift = shiftArr.find((s: any) => s.status === 'OPEN' || s.isActive) || shiftArr[0];

        if (activeShift) {
          shiftSessionId = activeShift.id;
          console.log(`[CartScreen] Ca làm việc hoạt động id=${shiftSessionId}`, JSON.stringify(activeShift));
        } else {
          console.warn('[CartScreen] Không tìm thấy ca làm việc hoạt động, phản hồi:', JSON.stringify(shifts));
        }
      } catch (shiftErr) {
        console.error('[CartScreen] Lỗi fetchActiveShiftSession:', shiftErr);
        // Thử tiếp tục mà không có shiftSessionId
      }

      if (!shiftSessionId) {
        console.warn('[CartScreen] Không có shiftSessionId — đơn hàng có thể thất bại nếu API yêu cầu');
      }

      // ── Bước 2: Xây dựng dữ liệu gửi đi (payload) ──────────────────────────────────────────────
      // Lấy tên khách hàng từ account đăng nhập, fallback 'Khách vãng lai'
      const customerName = user?.fullName || (user as any)?.full_name
        || user?.username || (user as any)?.name
        || 'Khách vãng lai';
      console.log(`[CartScreen] Tên khách hàng từ xác thực: "${customerName}"`);

      const payload: any = {
        branchId: 1,
        ...(shiftSessionId ? { shiftSessionId } : {}),
        customerName,
        items: items.map(item => ({
          productId: Number(item.id),
          selectedProductAttributeIds: item.selectedAttributes
            ?.map((a: any) => Number(a.id))
            .filter((id: number) => !isNaN(id)) || [],
          qty: item.quantity,
          note: item.note || '',
        })),
      };

      console.log('📦 [CartScreen] createOrder payload:', JSON.stringify(payload, null, 2));

      // ── Bước 3: Tạo đơn hàng ───────────────────────────────────────────────
      const res = await createOrder(payload);
      console.log('[CartScreen] Phản hồi tạo đơn hàng:', JSON.stringify(res, null, 2));

      // Lấy orderId từ response
      const newOrderId = (res as any)?.data?.id
        || (res as any)?.id
        || (res as any)?.data?.orderId;

      console.log(`[CartScreen] Đã tạo đơn hàng — orderId=${newOrderId}`);

      Toast.show({
        type: 'success',
        text1: '🎉 Đặt hàng thành công!',
        text2: `Đơn #${newOrderId} đang được xử lý.`,
      });

      clearCart();

      // Navigate đến OrderDetail nếu có ID, ngược lại về tab Orders
      if (newOrderId) {
        navigation.navigate('OrderDetail', { orderId: newOrderId });
      } else {
        console.warn('[CartScreen] Không có orderId trong phản hồi, đang chuyển hướng đến OrdersTab');
        navigation.navigate('Main', { screen: 'OrdersTab' });
      }
    } catch (error: any) {
      console.error('[CartScreen] Lỗi handleCheckout:', error);
      console.error('[CartScreen] Phản hồi lỗi:', JSON.stringify(error?.response?.data, null, 2));
      Toast.show({
        type: 'error',
        text1: 'Lỗi đặt hàng',
        text2: error?.response?.data?.error_cont || error?.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderRightActions = (progress: any, dragX: any, cartId: string) => {
    return (
      <TouchableOpacity 
        style={s.deleteAction} 
        onPress={() => removeItem(cartId)}
        activeOpacity={0.7}
      >
        <Trash2 size={24} color={COLORS.white} />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderRightActions={(p, d) => renderRightActions(p, d, item.cartId)}
      friction={2}
      rightThreshold={40}
    >
      <View style={s.cartItem}>
        <Image 
          source={{ uri: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' }} 
          style={s.image} 
        />
        <View style={s.itemInfo}>
          <View style={s.titleRow}>
            <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={s.itemOptions} numberOfLines={2}>
            {[
              item.selectedAttributes?.map((a: any) => a.name).join(' • '),
              item.note ? `📝 ${item.note}` : null
            ].filter(Boolean).join(' • ') || 'Không có tùy chọn'}
          </Text>
          <View style={s.priceQtyRow}>
            <Text style={s.itemPrice}>{formatCurrency(item.totalPrice || item.price)}</Text>
            <View style={s.quantityControl}>
              <TouchableOpacity 
                style={s.qtyBtn} 
                onPress={() => updateQuantity(item.cartId, Math.max(0, item.quantity - 1))}
              >
                <Minus size={14} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={s.qtyText}>{item.quantity}</Text>
              <TouchableOpacity 
                style={s.qtyBtn} 
                onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
              >
                <Plus size={14} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Giỏ hàng</Text>
          <TouchableOpacity onPress={clearCart}>
            <Text style={s.clearText}>Xóa hết</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 ? (
          <>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.cartId}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={s.footer}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Tổng cộng</Text>
                <Text style={s.totalValue}>{formatCurrency(totalPrice)}</Text>
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
            <ShoppingBag size={80} color={COLORS.borderLight} />
            <Text style={s.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={s.emptySubtitle}>Hãy chọn những món cà phê thơm ngon nhất nhé!</Text>
            <TouchableOpacity 
              style={s.shopBtn} 
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={s.shopBtnText}>Quay lại thực đơn</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );

};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  clearText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.error },

  listContent: { padding: 16 },
  cartItem: {
    flexDirection: 'row', padding: 16, marginBottom: 16,
    backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: COLORS.backgroundSecondary },
  itemInfo: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { flex: 1, fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginRight: 8 },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 110, // Khớp với chiều cao xấp xỉ của mục
    borderRadius: 16,
    marginBottom: 16,
    marginLeft: 10,
  },
  itemOptions: { fontFamily: FONTS.regular, fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 8 },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary },
  quantityControl: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6',
  },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, paddingHorizontal: 6 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.white },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontFamily: FONTS.medium, fontSize: 16, color: COLORS.textMuted },
  totalValue: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  checkoutBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  checkoutText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, marginTop: 20 },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 10 },
  shopBtn: { marginTop: 30, backgroundColor: COLORS.accent, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.white },
});

export default CartScreen;
